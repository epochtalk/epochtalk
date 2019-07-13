var Joi = require('joi');
var Promise = require('bluebird');

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {PUT} /admin/users/roles/add (Admin) Add Roles
  * @apiName AddUserRoleAdmin
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to add a role or roles to a user. This allows Administrators to add new
  * (Super) Administrators and (Global) Moderators.
  *
  * @apiParam (Payload) {string[]} usernames A unique array of usernames to grant the role to
  * @apiParam (Payload) {string} role_id The unique id of the role to grant the user
  *
  * @apiSuccess {object[]} users An array containing the users with added roles
  * @apiSuccess {string} users.id The user's unique id
  * @apiSuccess {string} users.username The user's username
  * @apiSuccess {string} users.email The user's email address
  * @apiSuccess {timestamp} users.created_at Timestamp of when the user's account was created
  * @apiSuccess {timestamp} users.updated_at Timestamp of when the user's account was last updated
  * @apiSuccess {object[]} users.roles An array containing the users role objects
  * @apiSuccess {string} users.roles.id The unique id of the role
  * @apiSuccess {string} users.roles.name The name of the role
  * @apiSuccess {string} users.roles.description The description of the role
  * @apiSuccess {object} users.roles.permissions The permissions that this role has
  * @apiSuccess {number{1..n}} users.roles.priority The priority of this role
  * @apiSuccess {string} users.roles.lookup The unique lookup string of this role
  * @apiSuccess {string} users.roles.highlight_color The html highlight color for this role
  * @apiSuccess {timestamp} users.roles.created_at Timestamp of when the role was created
  * @apiSuccess {timestamp} users.roles.updated_at Timestamp of when the role was last updated
  *
  * @apiError (Error 500) InternalServerError There was an error adding roles to the user
  */
module.exports = {
  method: 'PUT',
  path: '/api/users/roles/add',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'adminUsers.addRoles',
        data: {
          usernames: 'payload.usernames',
          role_id: 'payload.role_id'
        }
      }
    },
    validate: {
      payload: {
        usernames: Joi.array().items(Joi.string().required()).unique().min(1).required(),
        role_id: Joi.string().required()
      }
    },
    pre: [ { method: 'auth.users.addRoles(request.server, request.auth, request.payload.role_id, request.payload.usernames)' } ]
  },
  handler: function(request, reply) {
    var usernames = request.payload.usernames;
    var roleId = request.payload.role_id;
    var promise = request.db.users.addRoles(usernames, roleId)
    .tap(function(users) {
      return Promise.map(users, function(user) {
        var notification = {
          channel: { type: 'user', id: user.id },
          data: { action: 'reauthenticate' }
        };
        request.server.plugins.notifications.systemNotification(notification);
      });
    })
    .tap(function(users) {
      return Promise.map(users, function(user) {
        return request.session.updateRoles(user.id, user.roles);
      });
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
