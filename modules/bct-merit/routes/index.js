var Joi = require('joi');
var Boom = require('boom');
var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db/db'));
var errors = dbc.errors;
var BadRequestError = errors.BadRequestError;

/**
  * @apiVersion 0.4.0
  * @apiGroup Merit
  * @api {PUT} /merit Send Merit
  * @apiName SendMerit
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to send merit to another user
  *
  * @apiParam (Payload) {string} to_user_id The id of the rank to updated
  * @apiParam (Payload) {string} from_user_id The name of the rank
  * @apiParam (Payload) {string} post_id The post count needed to achieve the rank
  * @apiParam (Payload) {number} amount The post count needed to achieve the rank
  *
  * @apiSuccess {object[]} ranks The id of the rank to updated
  * @apiSuccess {string} ranks.name The name of the rank
  * @apiSuccess {number} ranks.post_count The post count needed to achieve the rank
  *
  * @apiError (Error 500) InternalServerError There was an issue upserting the rank
  */
var send = {
  method: 'PUT',
  path: '/api/merit',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      payload: Joi.object().keys({
        to_user_id: Joi.string().max(255).required(),
        post_id: Joi.string().max(255).required(),
        amount: Joi.number().required()
      })
    },
    pre: [ { method: 'auth.merit.canMerit(server, auth, payload.to_user_id, payload.post_id, payload.amount)' } ]
  },
  handler: function(request, reply) {
    var toUserId = request.payload.to_user_id;
    var fromUserId = request.auth.credentials.id;
    var postId = request.payload.post_id;
    var amount = request.payload.amount;

    var promise = request.db.merit.sendMerit(fromUserId, toUserId, postId, amount)
    .catch(BadRequestError, Boom.badRequest)
    .error(request.errorMap.toHttpError);
    return reply(promise);
  }
};

module.exports = [ send ];
