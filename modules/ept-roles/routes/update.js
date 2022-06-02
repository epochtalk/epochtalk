var Joi = require('@hapi/joi');
var _ = require('lodash');

/**
  * @apiVersion 0.4.0
  * @apiGroup Roles
  * @api {PUT} /admin/roles/update Update Roles
  * @apiName UpdateRoles
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Add a new role.
  *
  * @apiParam (Payload) {string} id The id of the role to update.
  * @apiParam (Payload) {string} name The updated name of the role.
  * @apiParam (Payload) {string} description The updated description of the role.
  * @apiParam (Payload) {string} priority The updated priorty of the role.
  * @apiParam (Payload) {string} [highlight_color] The updated highlight color.
  * @apiParam (Payload) {string} lookup The lookup string of the role.
  * @apiParam (Payload) {Object} permissions The updated permission set.
  *
  * @apiSuccess {string} id The unique id of the updated role.
  *
  * @apiError (Error 400) BadRequest There name of the role must be unique.
  * @apiError (Error 500) InternalServerError There was an issue adding the role.
  */
module.exports = {
  method: 'PUT',
  path: '/api/admin/roles/update',
  options: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'adminRoles.update',
        data: {
          id: 'payload.id',
          name: 'payload.name'
        }
      }
    },
    validate: {
      payload: Joi.object({
        id: Joi.string().required(),
        name: Joi.string().min(1).max(255).required(),
        description: Joi.string().min(1).max(1000).required(),
        priority: Joi.number().min(0).max(Number.MAX_VALUE).required(),
        highlight_color: Joi.string(),
        lookup: Joi.string().required(),
        permissions: Joi.object()
      })
    },
    pre: [ { method: (request) => request.server.methods.auth.roles.update(request.server, request.auth, request.roleValidations, request.payload) } ]
  },
  handler: function(request) {
    var role = request.payload;
    role.custom_permissions = role.permissions;
    delete role.permissions;
    var promise = request.db.roles.update(role)
    .then(function(result) {
      // Swap back custom permissions for auth
      role.permissions = role.custom_permissions;
      return result;
    })
    .tap(function(dbRole) {
      var roleClone = _.cloneDeep(dbRole);
      var notification = {
        channel: { type: 'role', id: roleClone.lookup },
        data: {}
      };
      request.server.plugins.notifications.systemNotification(notification);
    })
    .then(function(result) {
      var updateRole = role;
      updateRole.id = result.id; // undoes deslugify which happens in core
      // Update role in the in memory role object
      request.rolesAPI.updateRole(updateRole);
      return result;
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
