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
  * @apiSuccess {string[]} collapsed_categories The ids of the categories to collapse on boards view
  * @apiSuccess {string[]} ignored_boards The ids of the boards the user ignores
  *
  * @apiError (Error 500) InternalServerError There was an error getting the user's preferences
  */
module.exports = {
  method: 'GET',
  path: '/api/users/preferences',
  options: { auth: { strategy: 'jwt' } },
  handler: function(request) {
    if (!request.auth.isAuthenticated) { return Boom.badRequest(); }

    // get logged in user id
    var userId = request.auth.credentials.id;

    // get user's preferences
    var promise = request.db.users.preferences(userId)
    .then(function(user) { return user; })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
