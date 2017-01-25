var Joi = require('joi');
var Promise = require('bluebird');

/**
  * @apiDefine BoardObjectSuccess
  * @apiSuccess {string} id The board's unique id
  * @apiSuccess {string} name The board's name
  * @apiSuccess {string} description The boards description
  * @apiSuccess {timestamp} created_at Timestamp of when the board was created
  * @apiSuccess {timestamp} updated_at Timestamp of when the board was updated
  * @apiSuccess {timestamp} imported_at Timestamp of when the board was imported
  */

/**
  * @apiVersion 0.4.0
  * @apiGroup Boards
  * @api {POST} /boards Create
  * @apiName CreateBoard
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to create a new board
  *
  * @apiParam (Payload) {string} name The name of the board to be created
  * @apiParam (Payload) {string} description The description text for the board
  *
  * @apiUse BoardObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue creating the board
  */
module.exports = {
  method: 'POST',
  path: '/api/boards',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'boards.create',
        data: { boards: 'payload' }
      },
    },
    validate: {
      payload: Joi.array().items(Joi.object().keys({
        name: Joi.string().min(1).max(255).required(),
        description: Joi.string().max(255).allow(''),
        viewable_by: Joi.number(),
        postable_by: Joi.number()
      })).unique().min(1)
    },
    pre: [
      { method: 'auth.boards.create(server, auth)' },
      { method: 'common.boards.clean(sanitizer, payload)' }
    ]
  },
  handler: function(request, reply) {
    // create each board
    var promise = Promise.map(request.payload, function(board) {
      return request.db.boards.create(board);
    });

    return reply(promise);
  }
};
