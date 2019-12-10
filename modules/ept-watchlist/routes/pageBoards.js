var Joi = require('@hapi/joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Watchlist
  * @api {GET} /watchlist Page Watchlist Boards
  * @apiName PageWatchlistThreadsBoards
  * @apiDescription Page though a user's watched boards
  *
  * @apiParam (Query) {number} [page=1] The page of watchlist to bring back
  * @apiParam (Query) {number} [limit=25] The number of threads to bring back per page
  *
  * @apiSuccess {number} page The page of results being returned
  * @apiSuccess {number} limit The number of results per page
  * @apiSuccess {boolean} has_more_boards Boolean indicating if there are more pages of boards
  * @apiSuccess {object[]} boards An array containing watched board data
  * @apiSuccess {string} boards.id The unique id of the watched board
  * @apiSuccess {string} boards.name The name of the watched board
  * @apiSuccess {number} boards.post_count The post count of the watched board
  * @apiSuccess {number} boards.thread_count The thread count of the watched board
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the board watchlist threads.
  */
module.exports = {
  method: 'GET',
  path: '/api/watchlist/boards',
  options: {
    auth: { strategy: 'jwt' },
    validate: {
      query: Joi.object({
        page: Joi.number().default(1),
        limit: Joi.number().integer().min(1).max(100).default(25)
      })
    },
    pre: [ { method: (request) => request.server.methods.auth.watchlist.pageBoards(request.server, request.auth) } ],
  },
  handler: function(request) {
    var userId = request.auth.credentials.id;
    var opts = {
      page: request.query.page,
      limit: request.query.limit
    };

    var promise = request.db.watchlist.userWatchBoards(userId, opts)
    .then(function(boards) {
      var hasMoreBoards = false;
      if (boards.length > request.query.limit) {
        hasMoreBoards = true;
        boards.pop();
      }
      return {
        page: opts.page,
        limit: request.query.limit,
        boards: boards,
        has_more_boards: hasMoreBoards
      };
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
