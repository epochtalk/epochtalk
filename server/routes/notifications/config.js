var Joi = require('joi');
var path = require('path');
var Boom = require('boom');
var Promise = require('bluebird');
var common = require(path.normalize(__dirname + '/../../common'));

/**
  * @apiVersion 0.4.0
  * @apiGroup Notifications
  * @api {GET} /notifications/counts Get Notifications counts
  * @apiName CountNotifications
  * @apiPermission User
  * @apiDescription Get the notifications counts for this user.
  *
  * @apiUse NotificationsCountObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue getting the notifications counts
  */
exports.counts = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'notifications.counts' },
  handler: function(request, reply) {
    // get notifications counts for userId
    var userId = request.auth.credentials.id;
    var getNotificationsCounts = request.server.plugins.notifications.getNotificationsCounts(userId);

    var promise = getNotificationsCounts;
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Notifications
  * @api {DELETE} /notifications Dismiss
  * @apiName DismissNotification
  * @apiPermission User
  * @apiDescription Used to dismiss all notifications of a type.
  *
  * @apiParam {string} type The type of notifications to dismiss
  *
  * @apiUse NotificationsObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue dismissing the notifications
  */
exports.dismiss = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'notifications.dismiss' },
  validate: {
    query: Joi.object().keys({
      type: Joi.string().valid('message', 'mention', 'other').required()
    })
  },
  handler: function(request, reply) {
    // dismiss notifications for receiver_id
    var params = {
      receiver_id: request.auth.credentials.id,
      type: request.query.type
    };
    var dismiss = request.server.plugins.notifications.dismissNotifications(params);

    var promise = dismiss;
    return reply(promise);
  }
};
