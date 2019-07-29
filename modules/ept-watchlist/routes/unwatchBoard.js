var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Watchlist
  * @api {DELETE} /watchlist/boards/:id Unwatch Board
  * @apiName UnwatchBoard
  * @apiPermission User
  * @apiDescription Used to unmark a user as watching a board.
  *
  * @apiParam {string} id The unique id of the board being unwatched
  *
  * @apiSuccess {object} status 200 OK
  *
  * @apiError (Error 500) InternalServerError There was an issue unwatching the board
  */
module.exports = {
  method: 'DELETE',
  path: '/api/watchlist/boards/{id}',
  options: {
    auth: { strategy: 'jwt' },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: (request) => request.server.methods.auth.watchlist.unwatchBoard(request.server, request.auth) } ]
  },
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;
    var boardId = request.params.id;
    var promise = request.db.watchlist.unwatchBoard(userId, boardId)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
