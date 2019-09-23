var Joi = require('@hapi/joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Watchlist
  * @api {GET} /watchlist Page Watchlist Threads
  * @apiName PageWatchlistThreads
  * @apiDescription Page though a user's watched threads
  *
  * @apiParam (Query) {number} [page=1] The page of watchlist to bring back
  * @apiParam (Query) {number} [limit=25] The number of threads to bring back per page
  *
  * @apiSuccess {number} page The page of results being returned
  * @apiSuccess {number} limit The number of results per page
  * @apiSuccess {boolean} has_more_threads Boolean indicating if there are more pages of threads
  * @apiSuccess {object[]} threads An array containing watched thread data
  * @apiSuccess {string} threads.id The unique id of the watched thread
  * @apiSuccess {number} threads.post_count The post count of the watched thread
  * @apiSuccess {number} threads.view_count The view count of the watched thread
  * @apiSuccess {string} threads.board_name The name of the board the thread is in
  * @apiSuccess {string} threads.title The title of the thread being watched
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the watchlist threads.
  */
module.exports = {
  method: 'GET',
  path: '/api/watchlist/threads',
  options: {
    auth: { strategy: 'jwt' },
    validate: {
      query: {
        page: Joi.number().default(1),
        limit: Joi.number().integer().min(1).max(100).default(25)
      }
    },
    pre: [ { method: (request) => request.server.methods.auth.watchlist.pageThreads(request.server, request.auth) } ],
  },
  handler: function(request) {
    var userId = request.auth.credentials.id;
    var opts = {
      page: request.query.page,
      limit: request.query.limit
    };

    var promise = request.db.watchlist.userWatchThreads(userId, opts)
    .then(function(threads){
      var hasMoreThreads = false;
      if (threads.length > request.query.limit) {
        hasMoreThreads = true;
        threads.pop();
      }
      return {
        page: opts.page,
        limit: request.query.limit,
        threads: threads,
        has_more_threads: hasMoreThreads
      };
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
