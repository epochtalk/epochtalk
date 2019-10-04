var Joi = require('@hapi/joi');
var _ = require('lodash');
/**
  * @apiVersion 0.4.0
  * @apiGroup Roles
  * @api {GET} /admin/roles/:id/users Page Users with Role
  * @apiName PageUserWithRole
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Page all users with a particular role.
  *
  * @apiParam (Payload) {string} id The id of the role to find users for
  *
  * @apiParam (Query) {number} [page=1] The page of users to retrieve
  * @apiParam (Query) {number} [limit=15] The number of users to retrieve per page
  * @apiParam (Query) {string} [search] Allows user to filter the search results
  *
  * @apiSuccess {object[]} users An array holding users with this role
  * @apiSuccess {string} users.id The id of the user
  * @apiSuccess {string} users.username The The username of the user
  * @apiSuccess {string} users.email The email of the user
  * @apiSuccess {string[]} users.roles An array containing the lookups values of all the roles this user has
  * @apiSuccess {number} users.priority The user's highest role priority
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the user data.
  */
module.exports = {
  method: 'GET',
  path: '/api/admin/roles/{id}/users',
  options: {
    auth: { strategy: 'jwt' },
    validate: {
      params: Joi.object({ id: Joi.string().required() }),
      query: {
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(15),
        search: Joi.string()
      }
    },
    pre: [ { method: (request) => request.server.methods.auth.roles.users(request.server, request.auth) } ]
  },
  handler: function(request) {
    var roleId = request.params.id;
    var opts = {
      page: request.query.page,
      limit: request.query.limit,
      searchStr: request.query.search
    };
    var promise = request.db.roles.users(roleId, opts)
      .then(function(userData) {
        userData.users.map(function(user) {
          user.priority = _.min(user.roles.map(function(role) { return role.priority; }));
          user.roles = user.roles.map(function(role) { return role.lookup; });
        });
        return userData;
      })
      .error(request.errorMap.toHttpError);

    return promise;
  }
};
