var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Roles
  * @api {DELETE} /admin/roles/remove/:id Remove Roles
  * @apiName RemoveRoles
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Remove a role.
  *
  * @apiParam {string} id The id of the role to remove.
  *
  * @apiSuccess {string} id The unique id of the removed role.
  * @apiSuccess {string} name The name of the removed role.
  *
  * @apiError (Error 500) InternalServerError There was an issue removing the role.
  */
module.exports = {
  method: 'DELETE',
  path: '/api/admin/roles/remove/{id}',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'adminRoles.remove',
        data: {
          id: 'params.id',
          name: 'route.settings.plugins.mod_log.metadata.name'
        }
      }
    },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: (request) => request.server.methods.auth.roles.delete(request.server, request.auth, request.params.id) } ],
  },
  handler: function(request, reply) {
    var id = request.params.id;
    var promise = request.db.roles.delete(id)
      .then(function(result) {
        // Add deleted role name to plugin metadata
        request.route.settings.plugins.mod_log.metadata = {
          name: result.name
        };

        // Remove deleted role from in memory object
        request.rolesAPI.deleteRole(id);
        return result;
      })
      .error(request.errorMap.toHttpError);

    return promise;
  }
};
