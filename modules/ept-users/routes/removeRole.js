var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {PUT} /admin/users/roles/remove (Admin) Remove Roles
  * @apiName RemoveUserRoleAdmin
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to remove a role or roles from a user. This allows Administrators to remove
  * roles from an account.
  *
  * @apiParam (Payload) {string} user_id The unique id of the user to remove the role from
  * @apiParam (Payload) {string} role_id The unique id of the role to remove from the user
  *
  * @apiSuccess {string} id The user's unique id
  * @apiSuccess {string} username The user's username
  * @apiSuccess {string} email The user's email address
  * @apiSuccess {timestamp} created_at Timestamp of when the user's account was created
  * @apiSuccess {timestamp} updated_at Timestamp of when the user's account was last updated
  * @apiSuccess {object[]} roles An array containing the users role objects
  * @apiSuccess {string} roles.id The unique id of the role
  * @apiSuccess {string} roles.name The name of the role
  * @apiSuccess {string} roles.description The description of the role
  * @apiSuccess {object} roles.permissions The permissions that this role has
  * @apiSuccess {number{1..n}} roles.priority The priority of this role
  * @apiSuccess {string} roles.lookup The unique lookup string of this role
  * @apiSuccess {string} roles.highlight_color The html highlight color for this role
  * @apiSuccess {timestamp} roles.created_at Timestamp of when the role was created
  * @apiSuccess {timestamp} roles.updated_at Timestamp of when the role was last updated
  *
  * @apiError (Error 500) InternalServerError There was an error removing roles from the user
  */
module.exports = {
  method: 'PUT',
  path: '/api/users/roles/remove',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'adminUsers.removeRoles',
        data: {
          user_id: 'payload.user_id',
          role_id: 'payload.role_id'
        }
      }
    },
    validate: {
      payload: {
        user_id: Joi.string().required(),
        role_id: Joi.string().required()
      }
    },
    pre: [ { method: (request) => request.server.methods.auth.users.removeRole(request.server, request.auth, request.payload.user_id) } ]
  },
  handler: function(request, reply) {
    var userId = request.payload.user_id;
    var roleId = request.payload.role_id;
    var promise = request.db.users.removeRole(userId, roleId)
    .tap(function(user) {
      var notification = {
        channel: { type: 'user', id: user.id },
        data: { action: 'reauthenticate' }
      };
      request.server.plugins.notifications.systemNotification(notification);
    })
    .then(function(user) {
      return request.session.updateRoles(user.id, user.roles)
      .then(function() {
        var roleNames = user.roles.map(function(role) { return role.lookup; });
        // If they had the banned role removed, update the users ban info in redis/session
        if (roleNames.indexOf('banned') > -1) { return request.session.updateBanInfo(user.id); }
        else { return; }
      })
      .then(function() { return user; });
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
