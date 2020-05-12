var Joi = require('@hapi/joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Messages
  * @api {POST} /messages/unignore Unignore User's Messages
  * @apiName UnignoreUsersMessages
  * @apiPermission User
  * @apiDescription Used to unignore messages from a specific user's
  *
  * @apiParam (Payload) {string} username The name of the user to unignore messages from
  *
  * @apiSuccess {boolean} success True if the user was unignored
  *
  * @apiError (Error 500) InternalServerError There was an issue unignoring messages
  */
module.exports = {
  method: 'POST',
  path: '/api/messages/unignore',
  options: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: { payload: Joi.object({ username: Joi.string() }) }
  },
  handler: function(request) {
    var userId = request.auth.credentials.id;
    var ignoredUser = request.payload.username;
    var promise;
    if (ignoredUser) { // unignore one
      promise = request.db.users.userByUsername(ignoredUser)
      .then(function(user) {
        return request.db.messages.unignoreUser(userId, user.id);
      })
      .error(request.errorMap.toHttpError);
    }
    else { // unignore all
      promise = request.db.messages.unignoreUser(userId)
      .error(request.errorMap.toHttpError);
    }
    return promise;
  }
};
