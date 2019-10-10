var Joi = require('@hapi/joi');
var Promise = require('bluebird');

/**
  * @apiVersion 0.4.0
  * @apiGroup Threads
  * @api {GET} /threads/posted Page Recently Posted In Threads
  * @apiName RecentlyPostedInThreads
  * @apiDescription Used to page through recent threads posted in by the user.
  *
  * @apiParam (Query) {number} [page=1] The page of threads to bring back
  * @apiParam (Query) {number} [limit=25] The number of threads to bring back per page
  *
  * @apiSuccess {number} page The current page of threads.
  * @apiSuccess {number} limit The number of threads returned per page.
  * @apiSuccess {number} count The total number of threads for this user.
  * @apiSuccess {object[]} threads An array containing recently posted in threads.
  * @apiSuccess {string} threads.id The id of the thread
  * @apiSuccess {string} threads.board_id The id of the board the thread is in
  * @apiSuccess {string} threads.board_name The name of the board the thread is in
  * @apiSuccess {boolean} threads.locked Boolean indicating if the thread is locked
  * @apiSuccess {boolean} threads.threads Boolean indicating if the thread is stickied
  * @apiSuccess {boolean} threads.moderated Boolean indicating if the thread is self-moderated
  * @apiSuccess {boolean} threads.poll Boolean indicating if there is a poll in this thread
  * @apiSuccess {timestamp} threads.created_at Timestamp indicating when the thread was created
  * @apiSuccess {timestamp} threads.updated_at Timestamp indicating when the thread was last updated
  * @apiSuccess {number} threads.view_count The number of views this thread has received
  * @apiSuccess {number} threads.post_count The number of posts in this thread
  * @apiSuccess {string} threads.title The title of the thread
  * @apiSuccess {string} threads.last_post_id The id of the last post in the thread
  * @apiSuccess {number} threads.last_post_position The position of the last post in the thread
  * @apiSuccess {timestamp} threads.last_post_created_at Timestamp of when the last post was created
  * @apiSuccess {string} threads.last_post_username The username of the author of the last post
  * @apiSuccess {string} threads.last_post_avatar The avatar of the author of the last post
  * @apiSuccess {object} threads.user Object containg user data about the thread author
  * @apiSuccess {string} threads.user.id The id of the thread's author
  * @apiSuccess {string} threads.user.username The username of the thread's author
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the threads
  */
module.exports = {
  method: 'GET',
  path: '/api/threads/posted',
  options: {
    auth: { strategy: 'jwt' },
    validate: {
      query: Joi.object({
        page: Joi.number().default(1),
        limit: Joi.number().integer().min(1).max(100).default(25)
      })
    },
    pre: [ { method: (request) => request.server.methods.auth.threads.posted(request.server, request.auth), assign: 'priority' } ]
  },
  handler: function(request) {
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

    return promise;
  }
};
