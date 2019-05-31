var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Settings
  * @api {PUT} /admin/settings/blacklist (Admin) Update existing IP Rule in Blacklist
  * @apiName UpdateBlacklist
  * @apiDescription Used to update an existing IP Rule in the blacklist
  *
  * @apiSuccess {object[]} blacklist Array containing blacklisted IPs and info
  * @apiSuccess {string} blacklist.id Unique id for the Blacklisted IP rule.
  * @apiSuccess {string} blacklist.ip_data A single ip, ip range or wildcard ip.
  * @apiSuccess {string} blacklist.note A note/name for the Blacklisted IP rule.
  *
  * @apiError (Error 500) InternalServerError There was an issue updating the blacklist.
  */
module.exports = {
  method: 'PUT',
  path: '/api/admin/blacklist',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'adminSettings.updateBlacklist',
        data: {
          id: 'payload.id',
          ip_data: 'payload.ip_data',
          note: 'payload.note'
        }
      }
    },
    validate: {
      payload: {
        id: Joi.string().required(),
        ip_data: Joi.string().min(1).max(100),
        note: Joi.string().min(1).max(255)
      }
    },
    pre: [ { method: 'auth.blacklist.updateRule(server, auth)' } ]
  },
  handler: function(request, reply) {
    var updatedRule = request.payload;
    var promise = request.db.blacklist.updateRule(updatedRule)
    .then(function(blacklist) {
      request.server.plugins.blacklist.retrieveBlacklist();
      return blacklist;
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
