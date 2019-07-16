/**
  * @apiVersion 0.4.0
  * @apiGroup Trust
  * @api {GET} /admin/trustlist Get Default Trust List
  * @apiName GetDefaultTrustList
  * @apiPermission Super Administrator
  * @apiDescription Retrieve trust list for default trust account
  *
  * @apiSuccess {string} max_depth The max depth for this user's trust web
  * @apiSuccess {object[]} trustList An array of trusted users.
  * @apiSuccess {string} trustList.user_id_trusted The unique id of the user being trusted.
  * @apiSuccess {string} trustList.username_trusted The username of the user being trusted.
  * @apiSuccess {number} trustList.type Type 0 which represents trusted users.
  * @apiSuccess {object[]} untrustList An array of untrusted users.
  * @apiSuccess {string} untrustList.user_id_trusted The unique id of the user being untrusted.
  * @apiSuccess {string} untrustList.username_trusted The username of the user being untrusted.
  * @apiSuccess {number} untrustList.type Type 1 which represents untrusted users.
  *
  * @apiError (Error 403) Forbidden User doesn't have permissions to get the default trust list.
  * @apiError (Error 500) InternalServerError There was an issue retrieving the default trust list.
  */
module.exports = {
  method: 'GET',
  path: '/api/admin/trustlist',
  config: {
    auth: { strategy: 'jwt' },
    pre: [ { method: (request) => request.server.methods.auth.userTrust.getDefaultTrustList(request.server, request.auth) } ]
  },
  handler: function(request, reply) {
    var defaultTrustId = 'U31jnDtQRUW-oYs4rM9Ajg';
    var promise = request.db.userTrust.getTrustList(defaultTrustId)
    .error(request.errorMap.toHttpError);
    return promise;
  }
};
