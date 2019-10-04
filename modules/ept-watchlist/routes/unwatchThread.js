var Joi = require('@hapi/joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Watchlist
  * @api {DELETE} /watchlist/threads/:id Unwatch Thread
  * @apiName UnwatchThread
  * @apiPermission User
  * @apiDescription Used to unmark a user as watching a thread.
  *
  * @apiParam {string} id The unique id of the thread being unwatched
  *
  * @apiSuccess {object} status 200 OK
  *
  * @apiError (Error 500) InternalServerError There was an issue unwatching the thread
  */
module.exports = {
  method: 'DELETE',
  path: '/api/watchlist/threads/{id}',
  options: {
    auth: { strategy: 'jwt' },
    validate: { params: Joi.object({ id: Joi.string().required() }) },
    pre: [ { method: (request) => request.server.methods.auth.watchlist.unwatchThread(request.server, request.auth) } ],
  },
  handler: function(request) {
    var userId = request.auth.credentials.id;
    var boardId = request.params.id;
    var promise = request.db.watchlist.unwatchThread(userId, boardId)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
