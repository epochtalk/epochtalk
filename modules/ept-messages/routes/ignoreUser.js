var Joi = require('@hapi/joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Messages
  * @api {POST} /messages/ignore Ignore User's Messages
  * @apiName IgnoreUsersMessages
  * @apiPermission User
  * @apiDescription Used to ignore messages from a specific user
  *
  * @apiParam (Payload) {string} username The name of the user to ignore messages from
  *
  * @apiSuccess {boolean} success True if the user was ignored
  *
  * @apiError (Error 500) InternalServerError There was an issue ignoring messages
  */
module.exports = {
  method: 'POST',
  path: '/api/messages/ignore',
  options: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: { payload: Joi.object({ username: Joi.string().required() }) }
  },
  handler: function(request) {
    var userId = request.auth.credentials.id;
    var ignoredUser = request.payload.username;
    var promise = request.db.users.userByUsername(ignoredUser)
    .then(function(user) {
      return request.db.messages.ignoreUser(userId, user.id);
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
