var Joi = require('joi');

var getNotificationSettings = {
  method: 'GET',
  path: '/api/threadnotifications',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true }
  },
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;

    var promise = request.db.threadNotifications.getNotificationSettings(userId)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};

var enableNotifications = {
  method: 'PUT',
  path: '/api/threadnotifications',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: { payload: { enabled: Joi.boolean().default(true) } }
  },
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;
    var enabled = request.payload.enabled;

    var promise = request.db.threadNotifications.enableNotifications(userId, enabled)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};

var removeSubscriptions = {
  method: 'DELETE',
  path: '/api/threadnotifications',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true }
  },
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;

    var promise = request.db.threadNotifications.removeSubscriptions(userId)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};

module.exports = [
  getNotificationSettings,
  enableNotifications,
  removeSubscriptions
];
