var Boom = require('boom');
var Promise = require('bluebird');

/**
  * @apiVersion 0.4.0
  * @apiGroup Portal
  * @api {GET} /portal Portal Contents
  * @apiName ViewPortal
  * @apiDescription Used to retrieve the portal contents.
  *
  * @apiSuccess {object} data Object containing board, thread, and recent thread data
  * @apiSuccess {object[]} data.boards contains boards to be displayed in portal
  * @apiSuccess {string} data.boards.id The id of the board
  * @apiSuccess {string} data.boards.name The name of the board
  * @apiSuccess {string} data.boards.parent_id The id of the parent board if applicable
  * @apiSuccess {number} data.boards.viewable_by The minimum priority to be able to view the board, null for no restriction
  * @apiSuccess {number} data.boards.postable_by The minimum priority to be able to post to the board, null for no restriction (stripped=false)
  * @apiSuccess {string} data.boards.description The board description text(stripped=false)
  * @apiSuccess {number} data.boards.thread_count The number of threads within the board (stripped=false)
  * @apiSuccess {number} data.boards.post_count The number of posts within the board(stripped=false)
  * @apiSuccess {object[]} data.boards.moderators Array containing data about the moderators of the board (stripped=false)
  * @apiSuccess {string} data.boards.moderators.id The id of the moderator
  * @apiSuccess {string} data.boards.moderators.username The username of the moderator
  * @apiSuccess {timestamp} data.boards.created_at The created at timestamp of the board(stripped=false)
  * @apiSuccess {timestamp} data.boards.updated_at The updated at timestamp of the board(stripped=false)
  * @apiSuccess {timestamp} data.boards.imported_at The imported at timestamp of the board(stripped=false)
  *
  * @apiSuccess {object[]} data.threads contains threads with most recent posts (stripped=false)
  * @apiSuccess {string} data.threads.id The id of the thread
  * @apiSuccess {boolean} data.threads.locked Boolean indicating if the thread is locked
  * @apiSuccess {boolean} data.threads.sticky Boolean indicating if the thread is stickied
  * @apiSuccess {boolean} data.threads.moderated Boolean indicating if the thread is self moderated
  * @apiSuccess {boolean} data.threads.poll Boolean indicating if the thread has a poll
  * @apiSuccess {timestamp} data.threads.updated_at updated at timestamp of the thread
  * @apiSuccess {number} data.threads.view_count View count of the thread
  * @apiSuccess {string} data.threads.title The title of the thread
  * @apiSuccess {string} data.threads.last_post_id The id of the last post
  * @apiSuccess {number} data.threads.last_post_position The position of the last post
  * @apiSuccess {timestamp} data.threads.last_post_created_at Created at timestamp of last post
  * @apiSuccess {timestamp} data.threads.last_post_updated_at Updated at timestamp of last post
  * @apiSuccess {string} data.threads.post_body The body of the post
  * @apiSuccess {string} data.threads.post_avatar The avatar of the user who made the last post
  * @apiSuccess {string} data.threads.post_signature The signature of the user who made the last post
  * @apiSuccess {string} data.threads.post_user_name the name of the user who made the last post
  * @apiSuccess {string} data.threads.post_highlight_color The highlight color of the user who made the last post
  * @apiSuccess {string} data.threads.post_role_name The role of the user who made the last post
  * @apiSuccess {string} data.threads.last_post_username The username of the user who made the last post
  * @apiSuccess {object} data.threads.user The user who created the post
  * @apiSuccess {string} data.threads.user.id The id of the user who created the last post
  * @apiSuccess {string} data.threads.user.username The username of the user who created the last post
  * @apiSuccess {boolean} data.threads.user.deleted Boolean indicating if the user who created the last post had their account deleted
  *
  * @apiSuccess {object[]} data.recent contains threads with most recent posts (stripped=false)
  * @apiSuccess {string} data.recent.id The id of the thread
  * @apiSuccess {boolean} data.recent.locked Boolean indicating if the thread is locked
  * @apiSuccess {boolean} data.recent.sticky Boolean indicating if the thread is stickied
  * @apiSuccess {boolean} data.recent.moderated Boolean indicating if the thread is self moderated
  * @apiSuccess {boolean} data.recent.poll Boolean indicating if the thread has a poll
  * @apiSuccess {timestamp} data.recent.updated_at updated at timestamp of the thread
  * @apiSuccess {number} data.recent.view_count View count of the thread
  * @apiSuccess {string} data.recent.title The title of the thread
  * @apiSuccess {object} data.recent.board The board the thread is in
  * @apiSuccess {string} data.recent.board.id The id of the board
  * @apiSuccess {string} data.recent.board.name The name of the board
  * @apiSuccess {object} data.recent.post The post object for the thread
  * @apiSuccess {string} data.recent.post.id The id of the post
  * @apiSuccess {number} data.recent.post.position The position of the last post
  * @apiSuccess {timestamp} data.recent.post.created_at The created at timestamp of the post
  * @apiSuccess {boolean} data.recent.post.deleted Boolean indicating if the post was deleted
  * @apiSuccess {object} data.recent.user The user who created the post
  * @apiSuccess {string} data.recent.user.id The id of the user who created the last post
  * @apiSuccess {string} data.recent.user.username The username of the user who created the last post
  * @apiSuccess {boolean} data.threads.user.deleted Boolean indicating if the user who created the last post had their account deleted
  *
  *
  * @apiError (Error 400) BadRequest Portal is disabled.
  * @apiError (Error 500) InternalServerError There was an issue retrieving portal content.
  */
module.exports = {
  method: 'GET',
  path: '/api/portal',
  config: {
    app: { hook: 'portal.view' },
    auth: { mode: 'try', strategy: 'jwt' },
    pre: [
      { method: 'auth.portal.view(server, auth)', assign: 'priority' },
      { method: 'hooks.preProcessing' },
      [
        { method: 'hooks.parallelProcessing', assign: 'parallelProcessed' },
        { method: processing, assign: 'processed' },
      ],
      { method: 'hooks.merge' },
      { method: 'hooks.postProcessing' }
    ]
  },
  handler: function(request, reply) {
    return reply(request.pre.processed);
  }
};


function processing(request, reply) {
  var config = request.server.app.config;
  var boardId = config.portal.boardId;
  if (!boardId) { return reply(Boom.badRequest('Board Not Set routes')); }

  var userId;
  var opts = { limit: 10, page: 1 };
  var priority = request.pre.priority;
  if (request.auth.isAuthenticated) { userId = request.auth.credentials.id; }

  var getBoard = request.db.boards.find(boardId, priority);
  var getThreads = request.db.portal.threads(boardId, userId, opts);
  var getRecentThreads = request.db.threads.recent(userId, priority, opts);

  var promise = Promise.join(getBoard, getThreads, getRecentThreads, function(board, threads, recent) {
    return {
      board: board,
      threads: threads,
      recent: recent
    };
  })
  .error(request.errorMap.toHttpError);

  return reply(promise);
}
