var Joi = require('@hapi/joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Mentions
  * @api {DELETE} /mentions Delete Mentions
  * @apiName DeleteMentions
  * @apiPermission User
  * @apiDescription Used to delete a user's mentions
  *
  * @apiParam (Query) {string} id The id of the mention to delete
  *
  * @apiSuccess {boolean} deleted True if the mention was deleted
  *
  * @apiError (Error 500) InternalServerError There was an issue deleting the mention
  */
module.exports = {
  method: 'DELETE',
  path: '/api/mentions',
  options: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: { query: Joi.object({ id: Joi.string() }) },
    pre: [{ method: (request) => request.server.methods.auth.mentions.delete(request.server, request.auth) }],
  },
  handler: function(request) {
    var userId = request.auth.credentials.id;
    var mentionId = request.query.id;
    var promise = request.db.mentions.remove(mentionId, userId)
    .tap(function() {
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
