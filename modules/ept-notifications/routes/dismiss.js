var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Notifications
  * @api {POST} /notifications Dismiss
  * @apiName DismissNotification
  * @apiPermission User
  * @apiDescription Used to dismiss all notifications of a type.
  *
  * @apiParam (Payload) {string="message", "mention", "other"} type The type of notifications to dismiss
  * @apiParam (Payload) {string} id The id of the specific notification to dismiss
  *
  * @apiSuccess {object} STATUS 200 OK
  *
  * @apiError (Error 500) InternalServerError There was an issue dismissing the notifications
  */
module.exports = {
  method: 'POST',
  path: '/api/notifications/dismiss',
  options: {
    auth: { strategy: 'jwt' },
    pre: [ { method: (request) => request.server.methods.auth.notifications.dismiss(request.server, request.auth) } ],
    validate: {
      payload: Joi.object().keys({
        type: Joi.string().valid('message', 'mention', 'other').required(),
        id: Joi.string()
      })
    }
  },
  handler: function(request, reply) {
    // dismiss notifications for receiver_id
    var params = {
      receiver_id: request.auth.credentials.id,
      type: request.payload.type,
      id: request.payload.id
    };
    var promise = request.db.notifications.dismiss(params)
    .tap(function() {
      var userId = request.auth.credentials.id;
      var notification = {
        channel: { type: 'user', id: userId },
        data: { action: 'refreshMentions' }
      };
      request.server.plugins.notifications.systemNotification(notification);
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
