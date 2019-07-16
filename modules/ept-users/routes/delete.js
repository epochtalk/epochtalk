var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {DELETE} /users/:id Delete
  * @apiName DeleteUser
  * @apiDescription Delete a user by userId
  *
  * @apiParam {string} id The id of the user to delete
  *
  * @apiSuccess {string} username The deleted user's username
  * @apiSuccess {string} email The deleted user's email
  *
  * @apiError (Error 500) InternalServerError There was an error deleteing the user
  */
module.exports = {
  method: 'DELETE',
  path: '/api/users/{id}',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'users.delete',
        data: {
          id: 'params.id',
          username: 'route.settings.plugins.mod_log.metadata.username',
          email: 'route.settings.plugins.mod_log.metadata.email'
        }
      }
    },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: (request) => request.server.methods.auth.users.delete(request.server, request.auth, request.params.id) } ],
  },
  handler: function(request, reply) {
    var userId = request.params.id;
    var promise = request.db.users.delete(userId)
    .then(function(deletedUser) {
      // Add deleted user info to plugin metadata
      request.route.settings.plugins.mod_log.metadata = {
        username: deletedUser.username,
        email: deletedUser.email
      };
      return deletedUser;
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
