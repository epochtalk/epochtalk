var Joi = require('@hapi/joi');
var Promise = require('bluebird');

/**
  * @apiVersion 0.4.0
  * @apiGroup Threads
  * @api {GET} /threads Page By Board
  * @apiName PageThreadsByBoard
  * @apiDescription Used to page through a board's threads.
  *
  * @apiParam (Query) {string} board_id The board whose threads to page through
  * @apiParam (Query) {number} [page=1] The page of threads to bring back
  * @apiParam (Query) {number} [limit=25] The number of threads to bring back per page
  *
  * @apiSuccess {number} page The page of threads to bring back
  * @apiSuccess {number} limit The number or threads per page to bring back
  * @apiSuccess {boolean} banned_from_board Boolean indicating if the authed user has been banned from the current thread's board
  * @apiSuccess {boolean} write_access Boolean indicating if the authed user has write access to this thread
  *
  * @apiSuccess {object} board Object containing information about the board the thread is in
  * @apiSuccess {string} board.id The id of the board
  * @apiSuccess {string} board.name The name of the board
  * @apiSuccess {string} board.parent_id The id of the parent board if applicable
  * @apiSuccess {boolean} board.watched Boolean indicating if the authed user is watching this board
  * @apiSuccess {number} board.viewable_by The minimum priority to be able to view the board, null for no restriction
  * @apiSuccess {number} board.postable_by The minimum priority to be able to post to the board, null for no restriction
  * @apiSuccess {string} board.description The board description text
  * @apiSuccess {number} board.thread_count The number of threads within the board
  * @apiSuccess {number} board.post_count The number of posts within the board
  * @apiSuccess {object[]} board.children An array containing child boards if applicable
  * @apiSuccess {object[]} board.moderators Array containing data about the moderators of the board
  * @apiSuccess {string} board.moderators.id The id of the moderator
  * @apiSuccess {string} board.moderators.username The username of the moderator
  * @apiSuccess {timestamp} board.created_at The created at timestamp of the board
  * @apiSuccess {timestamp} board.updated_at The updated at timestamp of the board
  * @apiSuccess {timestamp} board.imported_at The imported at timestamp of the board
  *
  * @apiSuccess {object[]} sticky An array of sticky threads within the board
  * @apiSuccess {string} sticky.id The id of the stickied thread
  * @apiSuccess {boolean} sticky.locked Boolean indicating if the thread is locked
  * @apiSuccess {boolean} sticky.sticky Boolean indicating if the thread is stickied
  * @apiSuccess {boolean} sticky.moderated Boolean indicating if the thread is self-moderated
  * @apiSuccess {boolean} sticky.poll Boolean indicating if there is a poll in this thread
  * @apiSuccess {timestamp} sticky.created_at Timestamp indicating when the thread was created
  * @apiSuccess {timestamp} sticky.updated_at Timestamp indicating when the thread was last updated
  * @apiSuccess {number} sticky.view_count The number of views this thread has received
  * @apiSuccess {number} sticky.post_count The number of posts in this thread
  * @apiSuccess {string} sticky.title The title of the thread
  * @apiSuccess {string} sticky.last_post_id The id of the last post in the thread
  * @apiSuccess {number} sticky.last_post_position The position of the last post in the thread
  * @apiSuccess {timestamp} sticky.last_post_created_at Timestamp of when the last post was created
  * @apiSuccess {string} sticky.last_post_username The username of the author of the last post
  * @apiSuccess {string} sticky.last_post_avatar The avatar of the author of the last post
  * @apiSuccess {object} sticky.user Object containg user data about the last post author
  * @apiSuccess {string} sticky.user.id The id of the last post's author
  * @apiSuccess {string} sticky.user.username The username of the last post's author
  * @apiSuccess {boolean} sticky.user.deleted Boolean indicating if the last post's author has had their account deleted
  * @apiSuccess {boolean} sticky.has_new_posts Boolean indicating if the thread has new posts since it was last viewed
  * @apiSuccess {number} sticky.lastest_unread_position The position of the last unread post
  * @apiSuccess {number} sticky.lastest_unread_post_id The id of the last unread post
  *
  * @apiSuccess {object[]} normal An array of threads within the board
  * @apiSuccess {string} normal.id The id of the thread
  * @apiSuccess {boolean} normal.locked Boolean indicating if the thread is locked
  * @apiSuccess {boolean} normal.normal Boolean indicating if the thread is stickied
  * @apiSuccess {boolean} normal.moderated Boolean indicating if the thread is self-moderated
  * @apiSuccess {boolean} normal.poll Boolean indicating if there is a poll in this thread
  * @apiSuccess {timestamp} normal.created_at Timestamp indicating when the thread was created
  * @apiSuccess {timestamp} normal.updated_at Timestamp indicating when the thread was last updated
  * @apiSuccess {number} normal.view_count The number of views this thread has received
  * @apiSuccess {number} normal.post_count The number of posts in this thread
  * @apiSuccess {string} normal.title The title of the thread
  * @apiSuccess {string} normal.last_post_id The id of the last post in the thread
  * @apiSuccess {number} normal.last_post_position The position of the last post in the thread
  * @apiSuccess {timestamp} normal.last_post_created_at Timestamp of when the last post was created
  * @apiSuccess {string} normal.last_post_username The username of the author of the last post
  * @apiSuccess {string} normal.last_post_avatar The avatar of the author of the last post
  * @apiSuccess {object} normal.user Object containg user data about the last post author
  * @apiSuccess {string} normal.user.id The id of the thread's author
  * @apiSuccess {string} normal.user.username The username of the thread's author
  * @apiSuccess {boolean} normal.user.deleted Boolean indicating if the thread's author has had their account deleted
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the threads
  */
module.exports = {
  method: 'GET',
  path: '/api/threads',
  options: {
    app: { hook: 'threads.byBoard' },
    auth: { mode: 'try', strategy: 'jwt' },
    validate: {
      query: Joi.object({
        board_id: Joi.string().required(),
        page: Joi.number().default(1),
        field: Joi.string().trim().valid('views', 'created_at', 'updated_at', 'post_count'),
        limit: Joi.number().integer().min(1).max(100).default(25),
        desc: Joi.boolean().default(true)
      })
    },
    pre: [
      { method: (request) => request.server.methods.auth.threads.byBoard(request.server, request.auth, request.query.board_id) },
      { method: (request) => request.server.methods.hooks.preProcessing(request) },
      [
        { method: (request) => request.server.methods.hooks.parallelProcessing(request), assign: 'parallelProcessed' },
        { method: processing, assign: 'processed' },
      ],
      { method: (request) => request.server.methods.hooks.merge(request) },
      { method: (request) => request.server.methods.hooks.postProcessing(request) }
    ],
    handler: function(request) {
      return request.pre.processed;
    }
  }
};

function processing(request) {
  var userId;
  if (request.auth.isAuthenticated) { userId = request.auth.credentials.id; }
  var userPriority = request.server.plugins.acls.getUserPriority(request.auth);
  var boardId = request.query.board_id;
  var opts = {
    limit: request.query.limit,
    page: request.query.page,
    sortField: request.query.field,
    desc: request.query.desc
  };

  var getWriteAccess = request.db.boards.getBoardWriteAccess(boardId, userPriority);
  var getThreads = request.db.threads.byBoard(boardId, userId, opts);
  var getBoard = request.db.boards.find(boardId, userPriority);
  var boardBans = request.db.bans.isNotBannedFromBoard(userId, { boardId: boardId })
  .then((notBanned) => { return !notBanned || undefined; });

  var promise = Promise.join(getWriteAccess, getThreads, getBoard, boardBans, function(writeAccess, threads, board, banned) {
    return {
      board: board,
      banned_from_board: banned,
      write_access: writeAccess,
      page: request.query.page,
      limit: request.query.limit, // limit can be modified by query
      field: request.query.field,
      desc: request.query.desc,
      normal: threads.normal,
      sticky: threads.sticky
    };
  })
  .error(request.errorMap.toHttpError);

  return promise;
}
