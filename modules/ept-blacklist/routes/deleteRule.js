var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Settings
  * @api {DELETE} /admin/settings/blacklist/:id (Admin) Delete existing IP Rule from Blacklist
  * @apiName DeleteBlacklist
  * @apiDescription Used to update an existing IP Rule in the blacklist
  *
  * @apiParam {string} id The id of the blacklist rule to delete
  *
  * @apiSuccess {object[]} blacklist Array containing blacklisted IPs and info
  * @apiSuccess {string} blacklist.id Unique id for the Blacklisted IP rule.
  * @apiSuccess {string} blacklist.ip_data A single ip, ip range or wildcard ip.
  * @apiSuccess {string} blacklist.note A note/name for the Blacklisted IP rule.
  *
  * @apiError (Error 500) InternalServerError There was an issue deleting from the blacklist.
  */
module.exports = {
  method: 'DELETE',
  path: '/api/admin/blacklist/{id}',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'adminSettings.deleteFromBlacklist',
        data: {
          note: 'route.settings.plugins.mod_log.metadata.note',
          ip_data: 'route.settings.plugins.mod_log.metadata.ip_data'
        }
      }
    },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: (request) => request.server.methods.auth.blacklist.deleteRule(request.server, request.auth) } ]
  },
  handler: function(request, reply) {
    var id = request.params.id;
    var promise = request.db.blacklist.deleteRule(id)
    .then(function(results) {
      // Assign deleted obj info to plugin metadata
      request.route.settings.plugins.mod_log.metadata = {
        note: results.rule.note,
        ip_data: results.rule.ip_data
      };

      request.server.plugins.blacklist.retrieveBlacklist();
      return results.blacklist;
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
