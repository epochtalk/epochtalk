var Joi = require('joi');
var Promise = require('bluebird');

/**
  * @apiVersion 0.4.0
  * @apiGroup Boards
  * @api {POST} /boards/:id Update
  * @apiName UpdateBoard
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to update an existing boards information.
  *
  * @apiParam {string} id The id of the board being updated
  *
  * @apiParam (Payload) {string} name The name of the board to be created
  * @apiParam (Payload) {string} description The description text for the board
  *
  * @apiUse BoardObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue updating the board
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
        postable_by: Joi.number().allow(null)
      })).unique().min(1)
    },
    pre: [
      { method: 'auth.boards.update(server, auth)' },
      { method: 'common.boards.clean(sanitizer, payload)' },
    ]
  },
  handler: function(request, reply) {
    // update each board
    var promise = Promise.map(request.payload, function(board) {
      return request.db.boards.update(board);
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
