var Joi = require('joi');
var Promise = require('bluebird');

/**
  * @apiVersion 0.4.0
  * @apiGroup Boards
  * @api {POST} /boards/:id Update
  * @apiName UpdateBoard
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to update an existing information for boards
  *
  * @apiParam (Payload) {object[]} boards Array containing the boards to create
  * @apiParam (Payload) {string} id The board id
  * @apiParam (Payload) {string{1..255}} name The name for the board
  * @apiParam (Payload) {string{0..255}} description The description text for the board
  * @apiParam (Payload) {number} viewable_by The minimum priority required to view the board, null for no restriction
  * @apiParam (Payload) {number} postable_by The minimum priority required to post in the board, null for no restriction
  *
  * @apiUse BoardObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue updating the boards
  */
module.exports = {
  method: 'PUT',
  path: '/api/boards',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'boards.update',
        data: { boards: 'payload' }
      }
    },
    validate: {
      payload: Joi.array().items(Joi.object().keys({
        id: Joi.string().required(),
        name: Joi.string().min(1).max(255),
        description: Joi.string().max(255).allow(''),
        viewable_by: Joi.number().allow(null),
        postable_by: Joi.number().allow(null),
        right_to_left: Joi.boolean().default(false)
      })).unique().min(1)
    },
    pre: [
      { method: (request) => request.server.methods.auth.boards.update(request.server, request.auth) },
      { method: 'common.boards.clean(sanitizer, request.payload)' },
    ]
  },
  handler: function(request, reply) {
    // update each board
    var promise = Promise.map(request.payload, function(board) {
      return request.db.boards.update(board);
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
