var Boom = require('boom');

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {GET} /users/preferences Preferences
  * @apiName UserPreferences
  * @apiDescription Get a user's preferences.
  *
  * @apiSuccess {number} posts_per_page The post limit for this user
  * @apiSuccess {number} threads_per_page The thread limit for this user
  * @apiSuccess {array} collapsed_categories The categories to collapse on boards view
  *
  * @apiError (Error 500) InternalServerError There was error looking up the user
  */
module.exports = {
  method: 'GET',
  path: '/api/users/preferences',
  config: { auth: { strategy: 'jwt' } },
  handler: function(request, reply) {
    if (!request.auth.isAuthenticated) { return reply(Boom.badRequest()); }

    // get logged in user id
    var userId = request.auth.credentials.id;

    // get user's preferences`
    var promise = request.db.users.preferences(userId)
    .then(function(user) { return user; })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
