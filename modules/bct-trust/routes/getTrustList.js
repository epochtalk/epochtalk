/**
  * @apiVersion 0.4.0
  * @apiGroup Trust
  * @api {GET} /trustlist Get Trust List
  * @apiName GetTrustList
  * @apiPermission User
  * @apiDescription Retrieve trust list for authed user's account
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
  * @apiError (Error 500) InternalServerError There was an issue retrieving the default trust list.
  */
module.exports = {
  method: 'GET',
  path: '/api/trustlist',
  options: {
    auth: { strategy: 'jwt' }
  },
  handler: function(request, reply) {
    var promise = request.db.userTrust.getTrustList(request.auth.credentials.id)
    .error(request.errorMap.toHttpError);
    return promise;
  }
};
