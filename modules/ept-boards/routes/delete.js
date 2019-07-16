var Joi = require('joi');
var Promise = require('bluebird');

/**
  * @apiVersion 0.4.0
  * @apiGroup Boards
  * @api {DELETE} /boards/:id Delete
  * @apiName DeleteBoard
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to delete an existing board from the forum.
  *
  * @apiParam (Payload) {string[]} board_ids An array of board ids to delete
  *
  * @apiSuccess {object[]} boards An array of the deleted boards
  * @apiSuccess {string} id The id of the deleted board
  * @apiSuccess {string} name The name of the deleted board
  *
  * @apiError (Error 500) InternalServerError There was an issue deleting the boards
  */
module.exports = {
  method: 'POST',
  path: '/api/boards/delete',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'boards.delete',
        data: {
          boards: 'payload.board_ids',
          names: 'route.settings.plugins.mod_log.metadata.names'
        }
      }
    },
    validate: { payload: { board_ids: Joi.array().items(Joi.string().required()).unique().min(1) } },
    pre: [ { method: (request) => request.server.methods.auth.boards.delete(request.server, request.auth) } ],
  },
  handler: function(request, reply) {

    var promise = Promise.map(request.payload.board_ids, function(boardId) {
      return request.db.boards.delete(boardId);
    })
    .then(function(boards) {
      var names = [];
      boards.forEach(function(board) { names.push(board.name); });
      request.route.settings.plugins.mod_log.metadata = { names: names.join(', ') };
      return boards;
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
