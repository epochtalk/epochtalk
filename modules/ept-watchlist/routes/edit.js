var Joi = require('joi');
var Promise = require('bluebird');

/**
  * @apiVersion 0.4.0
  * @apiGroup Watchlist
  * @api {GET} /watchlist Edit Watchlist
  * @apiName EditWatchlist
  * @apiDescription Used to edit a user's watchlist.
  *
  * @apiParam (Query) {number} page=1 The page of watchlist to bring back
  * @apiParam (Query) {number} limit=25 The number of threads to bring back per page
  *
  * @apiSuccess {array} threads Two arrays of watchlist threads and boards
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
        hasMoreThreads: hasMoreThreads,
        boards: boards,
        hasMoreBoards: hasMoreBoards
      };
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
