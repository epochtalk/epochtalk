/**
  * @apiVersion 0.4.0
  * @apiGroup Settings
  * @api {GET} /admin/settings/blacklist (Admin) Get Blacklist
  * @apiName GetBlacklist
  * @apiDescription Used to fetch the IP blacklist
  *
  * @apiSuccess {object[]} blacklist Array containing blacklisted IPs and info
  * @apiSuccess {string} blacklist.id Unique id for the Blacklisted IP rule.
  * @apiSuccess {string} blacklist.ip_data A single ip, ip range or wildcard ip.
  * @apiSuccess {string} blacklist.note A note/name for the Blacklisted IP rule.
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the blacklist.
  */
module.exports = {
  method: 'GET',
  path: '/api/admin/blacklist',
  config: {
    auth: { strategy: 'jwt' },
    pre: [ { method: (request) => request.server.methods.auth.blacklist.all(request.server, request.auth) } ]
  },
  handler: function(request, reply) {
    var promise = request.db.blacklist.all()
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
