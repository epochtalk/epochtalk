var Joi = require('joi');
var path = require('path');
var Boom = require('boom');
var Promise = require('bluebird');

/**
  * @apiVersion 0.4.0
  * @apiGroup Notifications
  * @api {GET} /notifications/counts Get Notifications counts
  * @apiName CountNotifications
  * @apiPermission User
  * @apiDescription Get the notifications counts for this user.
  *
  * @apiSuccess {object} notificationsCounts
  * @apiSuccess {number} notificationsCounts.message
  * @apiSuccess {number} notificationsCounts.mention
  * @apiSuccess {number} notificationsCounts.other
  *
  * @apiError (Error 500) InternalServerError There was an issue getting the notifications counts
  */
exports.counts = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'notifications.counts' },
  handler: function(request, reply) {
    // get notifications counts for userId
    var userId = request.auth.credentials.id;
    var promise = request.db.notifications.counts(userId, [
      { type: 'message', max: 10 },
      { type: 'mention', max: 99 }
    ]);
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
  * @apiParam (Query) {string="message", "mention", "other"} type The type of notifications to dismiss
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
    var promise = request.db.notifications.dismiss(params);
    return reply(promise);
  }
};
