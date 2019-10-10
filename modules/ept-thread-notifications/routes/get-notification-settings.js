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
module.exports = {
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
