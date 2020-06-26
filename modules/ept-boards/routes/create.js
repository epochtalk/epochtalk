var Joi = require('@hapi/joi');
var Promise = require('bluebird');

/**
  * @apiDefine BoardObjectSuccess
  * @apiSuccess {string} id The board's unique id
  * @apiSuccess {string} name The board's name
  * @apiSuccess {string} description The boards description
  * @apiSuccess {number} viewable_by The minimum priority required to view the board, null for no restriction
  * @apiSuccess {number} postable_by The minimum priority required to post in the board, null for no restriction
  */

/**
  * @apiVersion 0.4.0
  * @apiGroup Boards
  * @api {POST} /boards Create
  * @apiName CreateBoard
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to create a new board
  *
  * @apiParam (Payload) {object[]} boards Array containing the boards to create
  * @apiParam (Payload) {string{1..255}} name The name for the board
  * @apiParam (Payload) {string{0..255}} [description] The description text for the board
  * @apiParam (Payload) {number} [viewable_by] The minimum priority required to view the board, null for no restriction
  * @apiParam (Payload) {number} [postable_by] The minimum priority required to post in the board, null for no restriction
  *
  * @apiUse BoardObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue creating the board
  */
module.exports = {
  method: 'POST',
  path: '/api/boards',
  options: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'boards.create',
        data: { boards: 'payload' }
      },
    },
    validate: {
      payload: Joi.array().items(Joi.object({
        name: Joi.string().min(1).max(255).required(),
        description: Joi.string().max(255).allow(''),
        viewable_by: Joi.number(),
        postable_by: Joi.number(),
        right_to_left: Joi.boolean().default(false),
        disable_post_edit: Joi.number().min(0).max(99999),
        disable_signature: Joi.boolean().default(false)
        disable_selfmod: Joi.boolean().default(false)
      })).min(1)
    },
    pre: [
      { method: (request) => request.server.methods.auth.boards.create(request.server, request.auth) },
      { method: (request) => request.server.methods.common.boards.clean(request.sanitizer, request.payload) }
    ]
  },
  handler: function(request) {
    var boards = request.payload.map(function(board) {
      // create each board
      board.meta = {
        disable_post_edit: board.disable_post_edit,
        disable_signature: board.disable_signature,
        disable_selfmod: board.disable_selfmod
      };
      delete board.disable_post_edit;
      delete board.disable_signature;
      delete board.disable_selfmod;
      return board;
    });
    var promise = Promise.map(boards, function(board) {
      return request.db.boards.create(board);
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
