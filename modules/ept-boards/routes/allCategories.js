var Joi = require('joi');
var Promise = require('bluebird');

/**
  * @apiVersion 0.4.0
  * @apiGroup Categories
  * @api {GET} /boards All Categories (Filters Private)
  * @apiName AllCategories
  * @apiDescription Used to retrieve all boards within their respective categories.
  * @apiParam (Query) {number} page=1 The page of threads to bring back
 * @apiParam (Query) {number} limit=25 The number of threads to bring back per page
  * @apiSuccess {object} containing boards: [categories Array containing all of the forums boards in their respective categories], threads: [recent threads Array]
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving categories
  */
module.exports = {
  method: 'GET',
  path: '/api/boards',
  config: {
    auth: { mode: 'try', strategy: 'jwt' },
    validate: {
      query: {
        page: Joi.number().default(1),
        limit: Joi.number().integer().min(1).max(100).default(5),
        stripped: Joi.boolean()
      }
    },
    pre: [ { method: 'auth.boards.allCategories(server, auth)', assign: 'priority' } ]
  },
  handler: function(request, reply) {
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
    return reply(promise);
  }
};
