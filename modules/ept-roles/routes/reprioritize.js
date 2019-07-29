var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Roles
  * @api {UPDATE} /admin/roles/reprioritize Reprioritize Roles
  * @apiName ReprioritizeRoles
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Reprioritizes all roles.
  *
  * @apiParam (Payload) {object[]} roles Array containing role objects
  * @apiParam (Payload) {string} roles.id The id of the role
  * @apiParam (Payload) {string} roles.priority The updated priorty of the role
  *
  * @apiSuccess {object} STATUS 200 OK
  *
  * @apiError (Error 500) InternalServerError There was an issue reprioritizing the roles.
  */
module.exports = {
  method: 'PUT',
  path: '/api/admin/roles/reprioritize',
  options: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: { type: 'adminRoles.reprioritize' }
    },
    validate: {
      payload: Joi.array().items(Joi.object().keys({
        id: Joi.string().required(),
        priority: Joi.number().min(0).max(Number.MAX_VALUE).required(),
        lookup: Joi.string()
      }))
    },
    pre: [ { method: (request) => request.server.methods.auth.roles.reprioritize(request.server, request.auth) } ]
  },
  handler: function(request, reply) {
    var roles = request.payload;
    var promise = request.db.roles.reprioritize(roles)
      .then(function(result) {
        // update priorities for in memory roles object
        request.rolesAPI.reprioritizeRoles(roles);
        return result;
      })
      .error(request.errorMap.toHttpError);

    return promise;
  }
};
