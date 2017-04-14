var Joi = require('joi');
var Promise = require('bluebird');

/**
  * @apiVersion 0.4.0
  * @apiGroup Threads
  * @api {GET} /threads/posted Page Recently Posted In Threads
  * @apiName RecentlyPostedInThreads
  * @apiDescription Used to page through recent threads posted in by the user.
  *
  * @apiParam (Query) {number} page=1 The page of threads to bring back
  * @apiParam (Query) {number} limit=25 The number of threads to bring back per page
  *
  * @apiSuccess {array} threads An array containing recently posted in threads.
  * @apiSuccess {number} page The currently viewing page.
  * @apiSuccess {number} limit The limit of threads for this page.
  * @apiSuccess {number} count The total number of threads for this user.
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the threads
  */
module.exports = {
  method: 'GET',
  path: '/api/threads/posted',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      query: {
        page: Joi.number().default(1),
        limit: Joi.number().integer().min(1).max(100).default(25)
      }
    },
    pre: [ { method: 'auth.threads.posted(server, auth)', assign: 'priority' } ]
  },
  handler: function(request, reply) {
    var opts = {
      userId: request.auth.credentials.id,
      priority: request.pre.priority,
      limit: request.query.limit,
      page: request.query.page
    };

    var getThreads = request.db.threads.posted(opts);
    var getCount = request.db.threads.postedCount(opts);

    var promise = Promise.join(getThreads, getCount, function(threads, count) {
      return {
        threads: threads,
        page: request.query.page,
        limit: request.query.limit,
        count: count
      };
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
