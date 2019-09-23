var Joi = require('@hapi/joi');
var Promise = require('bluebird');

/**
  * @apiVersion 0.4.0
  * @apiGroup Categories
  * @api {GET} /boards All Categories (Filters Private)
  * @apiName AllCategories
  * @apiDescription Used to retrieve all boards within their respective categories.
  *
  * @apiParam (Query) {number} [page=1] The page of threads to bring back for recent threads
  * @apiParam (Query) {number{1..100}} [limit=25] The number of threads to bring back per page for recent threads
  * @apiParam (Query) {boolean} [stripped] If true brings back boards with no additional metadata
  *
  * @apiSuccess {object} data Object containing boards and recent thread data
  * @apiSuccess {object[]} data.boards contains boards in their respective categories
  * @apiSuccess {string} data.boards.id The id of the category
  * @apiSuccess {string} data.boards.name The name of the category
  * @apiSuccess {number} data.boards.view_order The view order of the category
  * @apiSuccess {number} data.boards.viewable_by The minimum priority to be able to view category, null for no restriction
  * @apiSuccess {number} data.boards.postable_by The minimum priority to be able to post in category, null for no restriction
  * @apiSuccess {timestamp} data.boards.imported_at If the category was imported, the import timestamp
  *
  * @apiSuccess {object[]} data.boards.boards Array containing boards nested within category
  * @apiSuccess {string} data.boards.boards.id The id of the board
  * @apiSuccess {string} data.boards.boards.name The name of the board
  * @apiSuccess {string} data.boards.boards.category_id The id of the category containing the board
  * @apiSuccess {string} data.boards.boards.parent_id The id of the parent board if applicable
  * @apiSuccess {number} data.boards.boards.view_order The view order of the board
  * @apiSuccess {number} data.boards.boards.viewable_by The minimum priority to be able to view the board, null for no restriction
  * @apiSuccess {number} data.boards.boards.postable_by The minimum priority to be able to post to the board, null for no restriction (stripped=false)
  * @apiSuccess {string} data.boards.boards.description The board description text(stripped=false)
  * @apiSuccess {number} data.boards.boards.thread_count The number of threads within the board (stripped=false)
  * @apiSuccess {number} data.boards.boards.post_count The number of posts within the board(stripped=false)
  * @apiSuccess {string} data.boards.boards.last_thread_id The id of the last posted in thread (stripped=false)
  * @apiSuccess {string} data.boards.boards.last_thread_title The title of the last posted in thread (stripped=false)
  * @apiSuccess {boolean} data.boards.boards.post_deleted Boolean indicating if the last post in the board was deleted (stripped=false)
  * @apiSuccess {number} data.boards.boards.last_post_postion The position of the last post within a thread in the board (stripped=false)
  * @apiSuccess {timestamp} data.boards.boards.last_post_created_at The created at timestamp of the most recent post (stripped=false)
  * @apiSuccess {string} data.boards.boards.last_post_username The username of the user who created the most recent post (stripped=false)
  * @apiSuccess {string} data.boards.boards.last_post_avatar The avatar of the user who created the most recent post (stripped=false)
  * @apiSuccess {string} data.boards.boards.user_id The id of the user who created the most recent post (stripped=false)
  * @apiSuccess {boolean} data.boards.boards.user_deleted Boolean indicating if the user who created the most recent post has had their account deleted (stripped=false)
  * @apiSuccess {object[]} data.boards.boards.children An array containing child boards if applicable
  * @apiSuccess {object[]} data.boards.boards.moderators Array containing data about the moderators of the board (stripped=false)
  * @apiSuccess {string} data.boards.boards.moderators.id The id of the moderator
  * @apiSuccess {string} data.boards.boards.moderators.username The username of the moderator
  * @apiSuccess {timestamp} data.boards.boards.created_at The created at timestamp of the board(stripped=false)
  * @apiSuccess {timestamp} data.boards.boards.updated_at The updated at timestamp of the board(stripped=false)
  * @apiSuccess {timestamp} data.boards.boards.imported_at The imported at timestamp of the board(stripped=false)
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
  * @apiSuccess {object} data.threads.board The board the thread is in
  * @apiSuccess {string} data.threads.board.id The id of the board
  * @apiSuccess {string} data.threads.board.name The name of the board
  * @apiSuccess {object} data.threads.post The post object for the thread
  * @apiSuccess {string} data.threads.post.id The id of the post
  * @apiSuccess {number} data.threads.post.position The position of the last post
  * @apiSuccess {timestamp} data.threads.post.created_at The created at timestamp of the post
  * @apiSuccess {boolean} data.threads.post.deleted Boolean indicating if the post was deleted
  * @apiSuccess {object} data.threads.user The user who created the post
  * @apiSuccess {string} data.threads.user.id The id of the user who created the last post
  * @apiSuccess {string} data.threads.user.username The username of the user who created the last post
  * @apiSuccess {boolean} data.threads.user.deleted Boolean indicating if the user who created the last post had their account deleted
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving boards
  */
module.exports = {
  method: 'GET',
  path: '/api/boards',
  options: {
    auth: { mode: 'try', strategy: 'jwt' },
    validate: {
      query: {
        page: Joi.number().default(1),
        limit: Joi.number().integer().min(1).max(100).default(5),
        stripped: Joi.boolean()
      }
    },
    pre: [ { method: (request) => request.server.methods.auth.boards.allCategories(request.server, request.auth), assign: 'priority' } ]
  },
  handler: function(request) {
    var userId;
    var priority = request.pre.priority;
    var opts = {
      hidePrivate: true,  // filter out private boards
      stripped: request.query.stripped, // only retrieve boards and categories no other metadata
      limit: request.query.limit,
      page: request.query.page
    };
    if (request.auth.isAuthenticated) { userId = request.auth.credentials.id; }

    var getAllCategories = request.db.boards.allCategories(priority, opts);
    var getRecentThreads = request.db.threads.recent(userId, priority, opts);

    var promise;
    if (opts.stripped) {
      promise = getAllCategories
      .then(function(boards) {
        return { boards: boards };
      })
     .error(request.errorMap.toHttpError);
    }
    else {
      promise = Promise.join(getAllCategories, getRecentThreads, function(boards, threads) {
        return {
          boards: boards,
          threads: threads
        };
      })
      .error(request.errorMap.toHttpError);
    }
    return promise;
  }
};
