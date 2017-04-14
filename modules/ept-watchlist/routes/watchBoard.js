var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Watchlist
  * @api {POST} /watchlist/boards/:id Watch Board
  * @apiName WatchBoard
  * @apiPermission User
  * @apiDescription Used to mark a user as watching a board.
  *
  * @apiUse WatchlistObjectPayload
  * @apiUse WatchlistObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue watching the board
  */
module.exports = {
  method: 'POST',
  path: '/api/watchlist/boards/{id}',
  config: {
    auth: { strategy: 'jwt' },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: 'auth.watchlist.watchBoard(server, auth, params.id)' }]
  },
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;
    var boardId = request.params.id;
    var promise = request.db.watchlist.watchBoard(userId, boardId)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
