var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Settings
  * @api {POST} /admin/settings/blacklist (Admin) Add IP Rule to Blacklist
  * @apiName AddToBlacklist
  * @apiDescription Used to add an IP Rule to the blacklist
  *
  * @apiSuccess {object[]} blacklist Array containing blacklisted IPs and info
  * @apiSuccess {string} blacklist.id Unique id for the Blacklisted IP rule.
  * @apiSuccess {string} blacklist.ip_data A single ip, ip range or wildcard ip.
  * @apiSuccess {string} blacklist.note A note/name for the Blacklisted IP rule.
  *
  * @apiError (Error 500) InternalServerError There was an issue adding to the blacklist.
  */
module.exports = {
  method: 'POST',
  path: '/api/admin/blacklist',
  options: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'adminSettings.addToBlacklist',
        data: {
          ip_data: 'payload.ip_data',
          note: 'payload.note'
        }
      }
    },
    validate: {
      payload: {
        ip_data: Joi.string().min(1).max(100),
        note: Joi.string().min(1).max(255)
      }
    },
    pre: [ { method: (request) => request.server.methods.auth.blacklist.addRule(request.server, request.auth) } ]
  },
  handler: function(request, reply) {
    var rule = request.payload;
    var promise = request.db.blacklist.addRule(rule)
    .then(function(blacklist) {
      request.server.plugins.blacklist.retrieveBlacklist();
      return blacklist;
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
