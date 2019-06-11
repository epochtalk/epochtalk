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
module.exports = {
  method: 'GET',
  path: '/api/notifications/counts',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      query: Joi.object().keys({
        max: Joi.number()
      })
    },
    plugins: { acls: 'notifications.counts' }
  },
  handler: function(request, reply) {
    // get notifications counts for userId
    var userId = request.auth.credentials.id;
    var opts =  { max: request.query.max };

    var promise = request.db.notifications.counts(userId, opts)
      .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
