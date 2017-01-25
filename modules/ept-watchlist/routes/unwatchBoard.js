var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Watchlist
  * @api {DELETE} /watchlist/boards/:id Unwatch Board
  * @apiName UnwatchBoard
  * @apiPermission User
  * @apiDescription Used to unmark a user as watching a board.
  *
  * @apiUse WatchlistObjectPayload
  * @apiUse WatchlistObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue unwatching the board
  */
module.exports = {
  method: 'DELETE',
  path: '/api/watchlist/boards/{id}',
  config: {
    auth: { strategy: 'jwt' },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: 'auth.watchlist.unwatchBoard(server, auth)' } ]
  },
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;
    var boardId = request.params.id;
    var promise = request.db.watchlist.unwatchBoard(userId, boardId);
    return reply(promise);
  }
};

/**
  * @apiDefine WatchlistObjectPayload
  * @apiParam (Payload) {string} id The unique id of the model being watched
  */

/**
  * @apiDefine WatchlistObjectSuccess
  * @apiSuccess {Object} HTTP Code STATUS 200 OK
  */
