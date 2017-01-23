var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Watchlist
  * @api {POST} /watchlist/threads/:id Watch Thread
  * @apiName WatchThread
  * @apiPermission User
  * @apiDescription Used to mark a user as watching a thread.
  *
  * @apiUse WatchlistObjectPayload
  * @apiUse WatchlistObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue watching the thread
  */
module.exports = {
  method: 'POST',
  path: '/api/watchlist/threads/{id}',
  config: {
    auth: { strategy: 'jwt' },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: 'auth.watchlist.watchThread(server, auth, params.id)' } ]
  },
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;
    var threadId = request.params.id;
    var promise = request.db.watchlist.watchThread(userId, threadId);
    return reply(promise);
  }
};
