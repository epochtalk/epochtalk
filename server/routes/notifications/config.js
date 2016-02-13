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
