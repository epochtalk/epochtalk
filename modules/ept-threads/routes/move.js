var Joi = require('joi');
var Boom = require('boom');

/**
  * @apiVersion 0.4.0
  * @apiGroup Threads
  * @api {POST} /threads/:id/move Move
  * @apiName MoveThread
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to move a thread to a different board.
  *
  * @apiParam {string} id The unique id of the thread to move
  * @apiParam (Payload) {string} newBoardId The unique id of the board to move this thread into.
  *
  * @apiUse ThreadObjectSuccess2
  *
  * @apiError BadRequest User attempted to move the thread to the same board it is already in
  * @apiError Unauthorized User doesn't have permissions to move the thread
  * @apiError (Error 500) InternalServerError There was an issue moving the thread
  */
module.exports = {
  method: 'POST',
  path: '/api/threads/{id}/move',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'threads.move',
        data: {
          id: 'params.id',
          new_board_id: 'payload.newBoardId',
          old_board_id: 'route.settings.plugins.mod_log.metadata.old_board_id',
          old_board_name: 'route.settings.plugins.mod_log.metadata.old_board_name'
        }
      }
    },
    validate: {
      params: { id: Joi.string().required() },
      payload: { newBoardId: Joi.string().required() }
    },
    pre: [ { method: 'auth.threads.move(server, auth, params.id)' } ]
  },
  handler: function(request, reply) {
    var threadId = request.params.id;
    var newBoardId = request.payload.newBoardId;

    // move thread
    var promise = request.db.threads.move(threadId, newBoardId)
    .then(function(oldBoard) {
      // append old board info to plugin metadata
      request.route.settings.plugins.mod_log.metadata = {
        old_board_id: oldBoard.old_board_id,
        old_board_name: oldBoard.old_board_name
      };
      return { id: threadId, board_id: newBoardId };
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
