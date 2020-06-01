/**
  * @apiVersion 0.4.0
  * @apiGroup Messages
  * @api {GET} /messages/settings Get Messages Settings
  * @apiName GetMessageSettings
  * @apiPermission User
  * @apiDescription Used to retreive the user's message settings
  *
  * @apiSuccess {boolean} email_messages Boolean indicating if the user is receiving emails when messaged
  * @apiSuccess {boolean} ignore_newbies Boolean indicating if the user allows newbies to send them messages
  *
  * @apiError (Error 500) InternalServerError There was an getting message settings
  */
module.exports = {
  method: 'GET',
  path: '/api/messages/settings',
  options: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true }
  },
  handler: function(request) {
    var userId = request.auth.credentials.id;

    var promise = request.db.messages.getMessageSettings(userId)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
