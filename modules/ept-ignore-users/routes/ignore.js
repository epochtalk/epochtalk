var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {POST} /ignoreUsers/ignore/:userId Ignore User Posts
  * @apiName IgnoreUserPosts
  * @apiPermission User
  * @apiDescription Used to ignore a particular user's posts
  *
  * @apiParam {string} userId The id of the user whose posts to ignore
  *
  * @apiSuccess {string} userId The id of the user whose posts are ignored
  * @apiSuccess {boolean} ignored Boolean indicating if the user's posts are being ignored
  *
  * @apiError (Error 500) InternalServerError There was an error ignoring the user's posts
  */
module.exports = {
  method: 'POST',
  path: '/api/ignoreUsers/ignore/{userId}',
  config: {
    auth: { strategy: 'jwt' },
    validate: { params: { userId: Joi.string().required() } },
  },
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;
    var ignoreUserId = request.params.userId;

    var promise = request.db.ignoreUsers.ignore(userId, ignoreUserId)
    .then(function() { return { userId: ignoreUserId, ignored: true }; })
    .error(function(err) {
      if (err.constraint) { return {}; }
      return request.errorMap.toHttpError(err);
    });

    return reply(promise);
  }
};
