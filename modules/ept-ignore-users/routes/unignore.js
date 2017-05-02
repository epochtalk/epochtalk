var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {POST} /ignoreUsers/unignore/:userId Unignore User Posts
  * @apiName IgnoreUserPosts
  * @apiPermission User
  * @apiDescription Used to unignore a particular user's posts
  *
  * @apiParam {string} userId The id of the user whose posts to unignore
  *
  * @apiSuccess {string} userId The id of the user whose posts are unignore
  * @apiSuccess {boolean} ignored Boolean indicating if the user's posts are being ignored
  *
  * @apiError (Error 500) InternalServerError There was error unignoring the user's posts
  */
module.exports = {
  method: 'POST',
  path: '/api/ignoreUsers/unignore/{userId}',
  config: {
    auth: { strategy: 'jwt' },
    validate: { params: { userId: Joi.string().required() } },
  },
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;
    var ignoreUserId = request.params.userId;

    var promise = request.db.ignoreUsers.unignore(userId, ignoreUserId)
    .then(function() { return { userId: ignoreUserId, ignored: false }; })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
