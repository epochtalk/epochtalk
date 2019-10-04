var Joi = require('@hapi/joi');



/**
  * @apiVersion 0.4.0
  * @apiGroup ThreadNotifications
  * @api {PUT} /threadnotifications Toggle Thread Notifications
  * @apiName ToggleThreadNotifications
  * @apiPermission User
  * @apiDescription Used to toggle thread notifications
  *
  * @apiParam (Payload) {boolean} [enabled=true] Boolean indicating if thread notifications are enabled or not
  *
  * @apiSuccess {boolean} enabled Boolean indicating if the thread notifications were enabled or not
  *
  * @apiError (Error 500) InternalServerError There was an enabling thread notifications
  */
var enableNotifications = {
  method: 'PUT',
  path: '/api/threadnotifications',
  options: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: { payload: Joi.object({ enabled: Joi.boolean().default(true) }) }
  },
  handler: function(request) {
    var userId = request.auth.credentials.id;
    var enabled = request.payload.enabled;

    var promise = request.db.threadNotifications.enableNotifications(userId, enabled)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};

module.exports = [
  getNotificationSettings,
  enableNotifications,
  removeSubscriptions
];
