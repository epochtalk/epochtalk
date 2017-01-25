var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Watchlist
  * @api {GET} /watchlist Page Watchlist Threads
  * @apiName PageWatchlistThreads
  * @apiDescription Page though a user's watched threads
  *
  * @apiParam (Query) {number} page=1 The page of watchlist to bring back
  * @apiParam (Query) {number} limit=25 The number of threads to bring back per page
  *
  * @apiSuccess {array} threads An array of threads being watched
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the watchlist threads.
  */
module.exports = {
  method: 'GET',
  path: '/api/watchlist/threads',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      query: {
        page: Joi.number().default(1),
        limit: Joi.number().integer().min(1).max(100).default(25)
      }
    },
    pre: [ { method: 'auth.watchlist.pageThreads(server, auth)' } ],
  },
  handler: function(request, reply) {
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
        hasMoreThreads: hasMoreThreads
      };
    });
    return reply(promise);
  }
};
