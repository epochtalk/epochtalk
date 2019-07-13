var Boom = require('boom');
var Promise = require('bluebird');

/**
  * @apiVersion 0.4.0
  * @apiGroup Portal
  * @api {GET} /portal Portal Contents
  * @apiName ViewPortal
  * @apiDescription Used to retrieve the portal contents.
  *
  * @apiSuccess {object[]} boards contains boards to be displayed in portal
  * @apiSuccess {string} boards.id The id of the board
  * @apiSuccess {string} boards.name The name of the board
  * @apiSuccess {string} boards.parent_id The id of the parent board if applicable
  * @apiSuccess {number} boards.viewable_by The minimum priority to be able to view the board, null for no restriction
  * @apiSuccess {number} boards.postable_by The minimum priority to be able to post to the board, null for no restriction (stripped=false)
  * @apiSuccess {string} boards.description The board description text(stripped=false)
  * @apiSuccess {number} boards.thread_count The number of threads within the board (stripped=false)
  * @apiSuccess {number} boards.post_count The number of posts within the board(stripped=false)
  * @apiSuccess {object[]} boards.moderators Array containing data about the moderators of the board (stripped=false)
  * @apiSuccess {string} boards.moderators.id The id of the moderator
  * @apiSuccess {string} boards.moderators.username The username of the moderator
  * @apiSuccess {timestamp} boards.created_at The created at timestamp of the board(stripped=false)
  * @apiSuccess {timestamp} boards.updated_at The updated at timestamp of the board(stripped=false)
  * @apiSuccess {timestamp} boards.imported_at The imported at timestamp of the board(stripped=false)
  *
  * @apiSuccess {object[]} threads contains threads with most recent posts (stripped=false)
  * @apiSuccess {string} threads.id The id of the thread
  * @apiSuccess {boolean} threads.locked Boolean indicating if the thread is locked
  * @apiSuccess {boolean} threads.sticky Boolean indicating if the thread is stickied
  * @apiSuccess {boolean} threads.moderated Boolean indicating if the thread is self moderated
  * @apiSuccess {boolean} threads.poll Boolean indicating if the thread has a poll
  * @apiSuccess {timestamp} threads.updated_at updated at timestamp of the thread
  * @apiSuccess {number} threads.view_count View count of the thread
  * @apiSuccess {string} threads.title The title of the thread
  * @apiSuccess {string} threads.last_post_id The id of the last post
  * @apiSuccess {number} threads.last_post_position The position of the last post
  * @apiSuccess {timestamp} threads.last_post_created_at Created at timestamp of last post
  * @apiSuccess {timestamp} threads.last_post_updated_at Updated at timestamp of last post
  * @apiSuccess {string} threads.post_body The body of the post
  * @apiSuccess {string} threads.post_avatar The avatar of the user who made the last post
  * @apiSuccess {string} threads.post_signature The signature of the user who made the last post
  * @apiSuccess {string} threads.post_user_name the name of the user who made the last post
  * @apiSuccess {string} threads.post_highlight_color The highlight color of the user who made the last post
  * @apiSuccess {string} threads.post_role_name The role of the user who made the last post
  * @apiSuccess {string} threads.last_post_username The username of the user who made the last post
  * @apiSuccess {object} threads.user The user who created the post
  * @apiSuccess {string} threads.user.id The id of the user who created the last post
  * @apiSuccess {string} threads.user.username The username of the user who created the last post
  * @apiSuccess {boolean} threads.user.deleted Boolean indicating if the user who created the last post had their account deleted
  *
  * @apiSuccess {object[]} recent contains threads with most recent posts (stripped=false)
  * @apiSuccess {string} recent.id The id of the thread
  * @apiSuccess {boolean} recent.locked Boolean indicating if the thread is locked
  * @apiSuccess {boolean} recent.sticky Boolean indicating if the thread is stickied
  * @apiSuccess {boolean} recent.moderated Boolean indicating if the thread is self moderated
  * @apiSuccess {boolean} recent.poll Boolean indicating if the thread has a poll
  * @apiSuccess {timestamp} recent.updated_at updated at timestamp of the thread
  * @apiSuccess {number} recent.view_count View count of the thread
  * @apiSuccess {string} recent.title The title of the thread
  * @apiSuccess {object} recent.board The board the thread is in
  * @apiSuccess {string} recent.board.id The id of the board
  * @apiSuccess {string} recent.board.name The name of the board
  * @apiSuccess {object} recent.post The post object for the thread
  * @apiSuccess {string} recent.post.id The id of the post
  * @apiSuccess {number} recent.post.position The position of the last post
  * @apiSuccess {timestamp} recent.post.created_at The created at timestamp of the post
  * @apiSuccess {boolean} recent.post.deleted Boolean indicating if the post was deleted
  * @apiSuccess {object} recent.user The user who created the post
  * @apiSuccess {string} recent.user.id The id of the user who created the last post
  * @apiSuccess {string} recent.user.username The username of the user who created the last post
  * @apiSuccess {boolean} threads.user.deleted Boolean indicating if the user who created the last post had their account deleted
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
      { method: (request) => request.server.methods.auth.portal.view(request.server, request.auth), assign: 'priority' },
      { method: (request) => request.server.methods.hooks.preProcessing },
      [
        { method: (request) => request.server.methods.hooks.parallelProcessing, assign: 'parallelProcessed' },
        { method: processing, assign: 'processed' },
      ],
      { method: (request) => request.server.methods.hooks.merge },
      { method: 'common.portal.parseOut(request.parser, request.pre.processed.threads)' },
      { method: (request) => request.server.methods.hooks.postProcessing }
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

  return promise;
}
