var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Boards
  * @api {POST} /boards/:id Find
  * @apiName FindBoard
  * @apiDescription Used to find a board.
  *
  * @apiParam {string} id The id of the board to lookup
  *
  * @apiUse BoardObjectSuccess
  * @apiSuccess {number} thread_count Number of threads this board contains
  * @apiSuccess {number} post_count Number of posts this board contains
  * @apiSuccess {array} moderators Moderators of this board
  *
  * @apiError (Error 500) InternalServerError There was an issue finding the board
  */
module.exports = {
  method: 'GET',
  path: '/api/boards/{id}',
  config: {
    auth: { mode:'try', strategy: 'jwt' },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: 'auth.boards.find(server, auth, params.id)' } ]
  },
  handler: function(request, reply) {
    var boardId = request.params.id;
    var userPriority = request.server.plugins.acls.getUserPriority(request.auth);

    var promise = request.db.boards.find(boardId, userPriority)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
