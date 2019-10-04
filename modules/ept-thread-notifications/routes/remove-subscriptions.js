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
