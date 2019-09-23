var Joi = require('@hapi/joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup ThreadNotifications
  * @api {GET} /threadnotifications Get Thread Notification Settings
  * @apiName GetThreadNotificationSettings
  * @apiPermission User
  * @apiDescription Used to retreive the user's thread notification settings
  *
  * @apiSuccess {boolean} notify_replied_threads Boolean indicating if the user is receiving thread notifications
  *
  * @apiError (Error 500) InternalServerError There was an getting thread notification settings
  */
var getNotificationSettings = {
  method: 'GET',
  path: '/api/threadnotifications',
  options: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true }
  },
  handler: function(request) {
    var userId = request.auth.credentials.id;

    var promise = request.db.threadNotifications.getNotificationSettings(userId)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};


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
    validate: { payload: { enabled: Joi.boolean().default(true) } }
  },
  handler: function(request) {
    var userId = request.auth.credentials.id;
    var enabled = request.payload.enabled;

    var promise = request.db.threadNotifications.enableNotifications(userId, enabled)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Mentions
  * @api {DELETE} /threadnotifications Remove Thread Subscriptions
  * @apiName RemoveThreadSubscriptions
  * @apiPermission User
  * @apiDescription Used to delete a user's thread subscriptions
  *
  * @apiSuccess {boolean} deleted True if the user's thread subscriptions were deleted
  *
  * @apiError (Error 500) InternalServerError There was an issue deleting the user's thread subscriptions
  */
var removeSubscriptions = {
  method: 'DELETE',
  path: '/api/threadnotifications',
  options: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true }
  },
  handler: function(request) {
    var userId = request.auth.credentials.id;

    var promise = request.db.threadNotifications.removeSubscriptions(userId)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};

module.exports = [
  getNotificationSettings,
  enableNotifications,
  removeSubscriptions
];
