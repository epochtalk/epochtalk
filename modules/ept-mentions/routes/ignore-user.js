var Joi = require('@hapi/joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Mentions
  * @api {POST} /mentions/ignore Ignore User's Mentions
  * @apiName IgnoreUsersMentions
  * @apiPermission User
  * @apiDescription Used to ignore mentions from a specific user's
  *
  * @apiParam (Payload) {string} username The name of the user to ignore mentions from
  *
  * @apiSuccess {boolean} success True if the user was ignored
  *
  * @apiError (Error 500) InternalServerError There was an issue ignoring mentions
  */
module.exports = {
  method: 'POST',
  path: '/api/mentions/ignore',
  options: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: { payload: { username: Joi.string().required() } }
  },
  handler: function(request) {
    var userId = request.auth.credentials.id;
    var ignoredUser = request.payload.username;
    var promise = request.db.users.userByUsername(ignoredUser)
    .then(function(user) {
      return request.db.mentions.ignoreUser(userId, user.id);
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
