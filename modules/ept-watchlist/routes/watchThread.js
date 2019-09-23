var Joi = require('@hapi/joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Watchlist
  * @api {POST} /watchlist/threads/:id Watch Thread
  * @apiName WatchThread
  * @apiPermission User
  * @apiDescription Used to mark a user as watching a thread.
  *
  * @apiParam {string} id The unique id of the thread being watched
  *
  * @apiSuccess {object} status 200 OK
  *
  * @apiError (Error 500) InternalServerError There was an issue watching the thread
  */
module.exports = {
  method: 'POST',
  path: '/api/watchlist/threads/{id}',
  options: {
    auth: { strategy: 'jwt' },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: (request) => request.server.methods.auth.watchlist.watchThread(request.server, request.auth, request.params.id) } ]
  },
  handler: function(request) {
    var userId = request.auth.credentials.id;
    var threadId = request.params.id;
    var promise = request.db.watchlist.watchThread(userId, threadId)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
