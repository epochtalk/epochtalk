var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Trust
  * @api {GET} /trusttree Get Trust Tree
  * @apiName GetTrustTree
  * @apiPermission User
  * @apiDescription Used to retrieve trust tree for the authed user.
  *
  * @apiParam (Query) {boolean} hierarchy Boolean indicating whether to grab the hierarchical trust view or the depth view
  *
  * @apiSuccess {object[]} depthObj Object containing trusted users at this depth, only returned if hierarchy query parameter is false
  * @apiSuccess {string} depthObj.depth The depth of the current depth object
  * @apiSuccess {object[]} depthObj.users Object containing trusted users
  * @apiSuccess {string} depthObj.users.id The id of the trusted/untrusted user
  * @apiSuccess {string} depthObj.users.username The username of the trusted/untrusted user
  * @apiSuccess {number} depthObj.users.level_trust The number of users at this level who trust this user
  *
  * @apiSuccess {object[]} trusted Object containing trusted users, only returned if hierarchy query parameter is true
  * @apiSuccess {object[]} trusted.trusted Object containing the current trusted user's trusted users, this is a nested object of trusted users and contains the same information
  * @apiSuccess {number} trusted.type 0 for trusted 1 for untrusted
  * @apiSuccess {string} trusted.user_id_trusted The id of the trusted/untrusted user
  * @apiSuccess {string} trusted.username_trusted The username of the trusted/untrusted user
  *
  * @apiError (Error 500) InternalServerError There was an retrieving trust tree.
  */
module.exports = {
  method: 'GET',
  path: '/api/trusttree',
  options: {
    auth: { strategy: 'jwt' },
    validate: { query: { hierarchy: Joi.boolean() } }
  },
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;
    var promise;
    if (request.query.hierarchy) {
      promise = request.db.userTrust.getTrustHierarchy(userId)
      .error(request.errorMap.toHttpError);
    }
    else {
      promise = request.db.userTrust.getTrustDepth(userId)
      .error(request.errorMap.toHttpError);
    }
    return promise;
  }
};
