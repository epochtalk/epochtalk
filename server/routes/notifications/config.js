var Joi = require('joi');


/**
  * @apiVersion 0.4.0
  * @apiGroup Notifications
  * @api {GET} /notifications/counts Get Notifications counts
  * @apiName CountNotifications
  * @apiPermission User
  * @apiDescription Get the notifications counts for this user.
  *
  * @apiSuccess {object} notificationsCounts Object containing notification count information
  * @apiSuccess {number} notificationsCounts.message Number of message notifications
  * @apiSuccess {number} notificationsCounts.mention Number of mention notifications
  * @apiSuccess {number} notificationsCounts.other Number of other notifications
  *
  * @apiError (Error 500) InternalServerError There was an issue getting the notifications counts
  */
exports.counts = {
  auth: { strategy: 'jwt' },
  validate: {
    query: Joi.object().keys({
      max: Joi.number()
    })
  },
  plugins: { acls: 'notifications.counts' },
  handler: function(request, reply) {
    // get notifications counts for userId
    var userId = request.auth.credentials.id;
    var opts =  { max: request.query.max };

    var promise = request.db.notifications.counts(userId, opts)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};

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
exports.dismiss = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'notifications.dismiss' },
  validate: {
    payload: Joi.object().keys({
      type: Joi.string().valid('message', 'mention', 'other').required(),
      id: Joi.string()
    })
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

    return reply(promise);
  }
};
