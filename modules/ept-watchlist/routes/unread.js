var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Watchlist
  * @api {GET} /watchlist Page Watchlist Unread
  * @apiName PageWatchlistUnread
  * @apiDescription Used to page through a user's watchlist filtered by threads with unread posts.
  *
  * @apiParam (Query) {number} [page=1] The page of watchlist to bring back
  * @apiParam (Query) {number} [limit=25] The number of threads to bring back per page
  *
  * @apiSuccess {number} page The page of results being returned
  * @apiSuccess {number} limit The number of results per page
  * @apiSuccess {boolean} has_more_threads Boolean indicating if there are more pages of threads
  * @apiSuccess {object[]} threads An array containing watched thread data
  * @apiSuccess {string} threads.id The unique id of the watched thread
  * @apiSuccess {boolean} threads.locked Boolean indicating if the thread is locked
  * @apiSuccess {boolean} threads.sticky Boolean indicating if the thread is stickied
  * @apiSuccess {boolean} threads.has_new_post Boolean indicating if the thread has new posts
  * @apiSuccess {timestamp} created_at Timestamp of when the thread was created
  * @apiSuccess {timestamp} updated_at Timestamp of when the thread was last updated
  * @apiSuccess {number} threads.view_count The view count of the watched thread
  * @apiSuccess {number} threads.post_count The post count of the watched thread
  * @apiSuccess {string} threads.title The title of the thread being watched
  * @apiSuccess {string} threads.last_post_id The id of the last post in the thread
  * @apiSuccess {number} threads.last_post_position The position of the last post in the thread
  * @apiSuccess {timestamp} threads.last_post_created_at Timestamp of when the last post was created
  * @apiSuccess {string} threads.last_post_username The username of the author of the last post
  * @apiSuccess {number} threads.last_unread_position The position of the last unread post
  * @apiSuccess {string} threads.last_unread_post_id The id of the last unread post
  * @apiSuccess {object} threads.user Object containing data about the author of the thread
  * @apiSuccess {string} threads.user.id The id of the author of the thread
  * @apiSuccess {string} threads.user.username The username of the author of the thread
  * @apiSuccess {boolean} threads.user.deleted Boolean indicating if the thread author has had their account deleted
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the watchlist threads.
  */
module.exports = {
  method: 'GET',
  path: '/api/watchlist',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      query: {
        page: Joi.number().default(1),
        limit: Joi.number().integer().min(1).max(100).default(25)
      }
    },
    pre: [ { method: (request) => request.server.methods.auth.watchlist.unread(request.server, request.auth) } ],
  },
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;
    var opts = {
      page: request.query.page,
      limit: request.query.limit
    };

    var promise = request.db.watchlist.unread(userId, opts)
    .then(function(threads) {
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

    return reply(promise);
  }
};
