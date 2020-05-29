var Joi = require('@hapi/joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Messages
  * @api {PUT} /messages/settings/newbie Toggle Newbie Messages
  * @apiName ToggleNewbieMessages
  * @apiPermission User
  * @apiDescription Used to toggle setting allowing messages from users with the newbie role
  *
  * @apiParam (Payload) {boolean} [enabled=true] Boolean indicating if message emails are enabled or not
  *
  * @apiSuccess {boolean} enabled Boolean indicating if the newbie messages are enabled or not
  *
  * @apiError (Error 500) InternalServerError There was an error toggling newbie message settings
  */
module.exports = {
  method: 'PUT',
  path: '/api/messages/settings/newbie',
  options: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: { payload: Joi.object({ enabled: Joi.boolean().default(true) }) }
  },
  handler: function(request) {
    var userId = request.auth.credentials.id;
    var enabled = request.payload.enabled;

    var promise = request.db.messages.enableNewbieMessages(userId, enabled)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
