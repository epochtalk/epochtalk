var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {GET} /ignoreUsers/ignored Ignore User Posts
  * @apiName IgnoreUserPosts
  * @apiPermission User
  * @apiDescription Used to ignore a particular user's posts
  *
  * @apiParam {string} userId The id of the user whose posts to ignore
  *
  * @apiSuccess {string} userId The id of the user whose posts are ignored
  * @apiSuccess {boolean} ignored Boolean indicating if the user's posts are being ignored
  *
  * @apiError (Error 500) InternalServerError There was error ignoring the user's posts
  */
module.exports = {
  method: 'GET',
  path: '/api/ignoreUsers/ignored',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      query: {
        limit: Joi.number().default(25),
        page: Joi.number().default(1)
      }
    },
  },
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;
    var opts = {
      page: request.query.page,
      limit: request.query.limit
    };

    var promise = request.db.ignoreUsers.ignored(userId, opts)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
