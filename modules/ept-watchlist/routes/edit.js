var Joi = require('joi');
var Promise = require('bluebird');

/**
  * @apiVersion 0.4.0
  * @apiGroup Watchlist
  * @api {GET} /watchlist View Edit Watchlist
  * @apiName EditWatchlist
  * @apiDescription Used to view boards and threads for editing a user's watchlist.
  *
  * @apiParam (Query) {number} [limit=25] The number of threads/boards to bring back per page
  *
  * @apiSuccess {number} page The page of results being returned
  * @apiSuccess {number} limit The number of results per page
  * @apiSuccess {boolean} has_more_threads Boolean indicating if there are more pages of threads
  * @apiSuccess {boolean} has_more_boards Boolean indicating if there are more pages of boards
  * @apiSuccess {object[]} threads An array containing watched thread data
  * @apiSuccess {string} threads.id The unique id of the watched thread
  * @apiSuccess {number} threads.post_count The post count of the watched thread
  * @apiSuccess {number} threads.view_count The view count of the watched thread
  * @apiSuccess {string} threads.board_name The name of the board the thread is in
  * @apiSuccess {string} threads.title The title of the thread being watched
  * @apiSuccess {object[]} boards An array containing watched board data
  * @apiSuccess {string} boards.id The unique id of the watched board
  * @apiSuccess {string} boards.name The name of the watched board
  * @apiSuccess {number} boards.post_count The post count of the watched board
  * @apiSuccess {number} boards.thread_count The thread count of the watched board
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the watchlist threads.
  */
module.exports = {
  method: 'GET',
  path: '/api/watchlist/edit',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      query: {
        limit: Joi.number().integer().min(1).max(100).default(25)
      }
    },
    pre: [ { method: 'auth.watchlist.edit(server, auth)' } ],
  },
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;
    var threadOpts = { page: 1, limit: request.query.limit };
    var boardOpts = { page: 1, limit: request.query.limit };

    var getThreads = request.db.watchlist.userWatchThreads(userId, threadOpts);
    var getBoards = request.db.watchlist.userWatchBoards(userId, boardOpts);

    var promise = Promise.join(getThreads, getBoards, function(threads, boards) {
      var hasMoreThreads = false, hasMoreBoards = false;
      if (threads.length > request.query.limit) {
        hasMoreThreads = true;
        threads.pop();
      }
      if (boards.length > request.query.limit) {
        hasMoreBoards = true;
        boards.pop();
      }
      return {
        page: 1,
        limit: request.query.limit,
        threads: threads,
        has_more_threads: hasMoreThreads,
        boards: boards,
        has_more_boards: hasMoreBoards
      };
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
