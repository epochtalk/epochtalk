var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Watchlist
  * @api {GET} /watchlist Page Watchlist Boards
  * @apiName PageWatchlistThreadsBoards
  * @apiDescription Page though a user's watched boards
  *
  * @apiParam (Query) {number} page=1 The page of watchlist to bring back
  * @apiParam (Query) {number} limit=25 The number of threads to bring back per page
  *
  * @apiSuccess {array} threads An array of boards being watched
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the watchlist threads.
  */
module.exports = {
  method: 'GET',
  path: '/api/watchlist/boards',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      query: {
        page: Joi.number().default(1),
        limit: Joi.number().integer().min(1).max(100).default(25)
      }
    },
    pre: [ { method: 'auth.watchlist.pageBoards(server, auth)' } ],
  },
  handler: function(request, reply) {
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
        hasMoreBoards: hasMoreBoards
      };
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
