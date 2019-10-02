var Joi = require('@hapi/joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Mentions
  * @api {PUT} /mentions/settings Toggle Mention Emails
  * @apiName ToggleMentionEmails
  * @apiPermission User
  * @apiDescription Used to toggle email notifications when mentioned
  *
  * @apiParam (Payload) {boolean} [enabled=true] Boolean indicating if mention emails are enabled or not
  *
  * @apiSuccess {boolean} enabled Boolean indicating if the mention emails were enabled or not
  *
  * @apiError (Error 500) InternalServerError There was an enabling mention emails
  */
var enableMentionEmails = {
  method: 'PUT',
  path: '/api/mentions/settings',
  options: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: { payload: { enabled: Joi.boolean().default(true) } }
  },
  handler: function(request) {
    var userId = request.auth.credentials.id;
    var enabled = request.payload.enabled;

    var promise = request.db.mentions.enableMentionEmails(userId, enabled)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
