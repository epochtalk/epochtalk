var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Trust
  * @api {POST} /trust Add Trust Feedback
  * @apiName AddTrustFeedback
  * @apiPermission User
  * @apiDescription Used to leave trust feedback on a user's account
  *
  * @apiParam (Payload) {string} user_id The unique id of the user feedback is being left for
  * @apiParam (Payload) {number} [risked_btc] The amount of BTC that was risked in the transaction
  * @apiParam (Payload) {boolean} scammer Boolean indicating if user is a scammer, true for negative feedback, false for positive, and null for neutral
  * @apiParam (Payload) {string} [reference] A reference link for the feedback
  * @apiParam (Payload) {string} [comments] Feedback comments
  *
  * @apiSuccess {string} id The unique id of the added feedback.
  * @apiSuccess {string} user_id The unique id of the user feedback was left on.
  * @apiSuccess {string} reporter_id The unique id of the user leaving feedback.
  * @apiSuccess {boolean} scammer Boolean indicating if user is a scammer, true for negative feedback, false for positive, and null for neutral.
  * @apiSuccess {string} reference A reference link for the feedback.
  * @apiSuccess {string} comments Feedback comments.
  * @apiSuccess {string} created_at Timestamp of when feedback was created.
  *
  * @apiError (Error 403) Forbidden User does not have permissions to add trust feedback
  * @apiError (Error 500) InternalServerError There was an issue adding feedback
  */
module.exports = {
  method: 'POST',
  path: '/api/trust',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      payload: {
        user_id: Joi.string().required(),
        risked_btc: Joi.number(),
        scammer: Joi.boolean().allow(null),
        reference: Joi.string().min(3).max(1024).optional(),
        comments: Joi.string().min(3).max(1024).required()
      }
    },
    pre: [ { method: 'auth.userTrust.addTrustFeedback(server, auth, request.payload.user_id)' } ]
  },
  handler: function(request, reply) {
    var opts = {
      userId: request.payload.user_id,
      reporterId: request.auth.credentials.id,
      riskedBtc: request.payload.risked_btc,
      scammer: request.payload.scammer,
      reference: request.payload.reference,
      comments: request.payload.comments
    };
    var promise = request.db.userTrust.addTrustFeedback(opts)
    .error(request.errorMap.toHttpError);
    return promise;
  }
};
