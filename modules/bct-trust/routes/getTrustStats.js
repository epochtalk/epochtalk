var Joi = require('joi');
var Boom = require('boom');
var querystring = require('querystring');

/**
  * @apiVersion 0.4.0
  * @apiGroup Trust
  * @api {GET} /trust/:username Get Trust Score Statistics
  * @apiName GetTrustScoreStats
  * @apiPermission User
  * @apiDescription Used to retrieve trust score for a particular user.
  *
  * @apiParam (Params) {string} username The username of the user to get trust stats for
  *
  * @apiSuccess {number} neg Negative trust review count.
  * @apiSuccess {number} pos Positive trust review count.
  * @apiSuccess {number} score Calculated trust score.
  *
  * @apiError (Error 500) InternalServerError There was an retrieving trust score stats.
  */
module.exports = {
  method: 'GET',
  path: '/api/trust/{username}',
  options: {
    auth: { strategy: 'jwt' },
    validate: { params: { username: Joi.string().required() } }
  },
  handler: function(request, reply) {
    var username = querystring.unescape(request.params.username);
    var promise = request.db.users.userByUsername(username)
    .catch(function() { return Boom.notFound(); })
    .then(function(user) {
      return request.db.userTrust.getTrustStats(user.id, request.auth.credentials.id);
    })
    .error(request.errorMap.toHttpError);
    return promise;
  }
};
