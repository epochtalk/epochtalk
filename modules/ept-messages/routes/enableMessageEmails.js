var Joi = require('@hapi/joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Messages
  * @api {PUT} /messages/settings Toggle Message Emails
  * @apiName ToggleMessageEmails
  * @apiPermission User
  * @apiDescription Used to toggle email notifications when messaged
  *
  * @apiParam (Payload) {boolean} [enabled=true] Boolean indicating if message emails are enabled or not
  *
  * @apiSuccess {boolean} enabled Boolean indicating if the message emails were enabled or not
  *
  * @apiError (Error 500) InternalServerError There was an enabling message emails
  */
module.exports = {
  method: 'PUT',
  path: '/api/messages/settings',
  options: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: { payload: Joi.object({ enabled: Joi.boolean().default(true) }) }
  },
  handler: function(request) {
    var userId = request.auth.credentials.id;
    var enabled = request.payload.enabled;

    var promise = request.db.messages.enableMessageEmails(userId, enabled)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
