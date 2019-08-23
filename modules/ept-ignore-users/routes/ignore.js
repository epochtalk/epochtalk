var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {POST} /ignoreUsers/ignore/:id Ignore User Posts
  * @apiName IgnoreUserPosts
  * @apiPermission User
  * @apiDescription Used to ignore a particular user's posts
  *
  * @apiParam {string} id The id of the user whose posts to ignore
  *
  * @apiSuccess {string} user_id The id of the user whose posts are ignored
  * @apiSuccess {boolean} ignored Boolean indicating if the user's posts are being ignored
  *
  * @apiError (Error 500) InternalServerError There was an error ignoring the user's posts
  */
module.exports = {
  method: 'POST',
  path: '/api/ignoreUsers/ignore/{id}',
  options: {
    auth: { strategy: 'jwt' },
    validate: { params: { id: Joi.string().required() } },
  },
  handler: function(request) {
    var userId = request.auth.credentials.id;
    var ignoreUserId = request.params.id;

    var promise = request.db.ignoreUsers.ignore(userId, ignoreUserId)
    .then(function() { return { user_id: ignoreUserId, ignored: true }; })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
