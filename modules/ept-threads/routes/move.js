var Joi = require('@hapi/joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Threads
  * @api {POST} /threads/:id/move Move
  * @apiName MoveThread
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to move a thread to a different board.
  *
  * @apiParam {string} id The unique id of the thread to move
  * @apiParam (Payload) {string} new_board_id The unique id of the board to move this thread into.
  *
  * @apiSuccess {string} id The id of the thread which was moved
  * @apiSuccess {string} board_id The id of the board which the thread was moved to
  *
  * @apiError (Error 401) Unauthorized User doesn't have permissions to move the thread
  * @apiError (Error 500) InternalServerError There was an issue moving the thread
  */
module.exports = {
  method: 'POST',
  path: '/api/threads/{id}/move',
  options: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'threads.move',
        data: {
          id: 'params.id',
          new_board_id: 'payload.new_board_id',
          old_board_id: 'route.settings.plugins.mod_log.metadata.old_board_id',
          old_board_name: 'route.settings.plugins.mod_log.metadata.old_board_name'
        }
      }
    },
    validate: {
      params: Joi.object({ id: Joi.string().required() }),
      payload: Joi.object({ new_board_id: Joi.string().required() })
    },
    pre: [ { method: (request) => request.server.methods.auth.threads.move(request.server, request.auth, request.params.id) } ]
  },
  handler: function(request) {
    var threadId = request.params.id;
    var newBoardId = request.payload.new_board_id;

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

    return promise;
  }
};
