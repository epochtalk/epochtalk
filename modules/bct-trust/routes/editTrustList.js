var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Trust
  * @api {POST} /trustlist Edit Trust List
  * @apiName EditTrustList
  * @apiPermission User
  * @apiDescription Used to edit the authed user's trust list
  *
  * @apiParam (Payload) {number} max_depth The max depth of the user's trust web
  * @apiParam (Payload) {object[]} list List containing trusted/untrusted users
  * @apiParam (Payload) {string} list.user_id_trusted The unique id of the user being trusted/untrusted
  * @apiParam (Payload) {string} list.username_trusted The username of the user being trusted/untrusted.
  * @apiParam (Payload) {number} list.type Trust type, 0 for trusted and 1 for untrusted
  *
  * @apiSuccess {string} max_depth The max depth for this user's trust web
  * @apiSuccess {object[]} trustList An array of trusted users.
  * @apiSuccess {string} trustList.user_id_trusted The unique id of the user being trusted.
  * @apiSuccess {string} trustList.username_trusted The username of the user being trusted.
  * @apiSuccess {number} trustList.type Type 0 which represents trusted users.
  * @apiSuccess {object[]} untrustList An array of untrusted users.
  * @apiSuccess {string} untrustList.user_id_trusted The unique id of the user being untrusted.
  * @apiSuccess {string} untrustList.username_trusted The username of the user being untrusted.
  * @apiSuccess {number} untrustList.type Type 1 which represents untrusted users.
  *
  * @apiError (Error 500) InternalServerError There was an issue editing user's trust list.
  */
module.exports = {
  method: 'POST',
  path: '/api/trustlist',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      payload: {
        max_depth: Joi.number().min(0).max(4).required(),
        list: Joi.array().items(Joi.object().keys({
          user_id_trusted: Joi.string().required(),
          username_trusted: Joi.string().required(),
          type: Joi.number().min(0).max(1).required()
        }))
      }
    }
  },
  handler: function(request, reply) {
    var opts = {
      userId: request.auth.credentials.id,
      maxDepth: request.payload.max_depth,
      list: request.payload.list
    };
    var promise = request.db.userTrust.editTrustList(opts)
    .error(request.errorMap.toHttpError);
    return reply(promise);
  }
};
