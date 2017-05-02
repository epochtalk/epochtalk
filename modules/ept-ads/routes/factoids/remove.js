var Joi = require('joi');
var Boom = require('boom');
var path = require('path');
var db = require(path.normalize(__dirname + '/../../db'));

function auth(request, reply) {
  var promise = request.server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: request.server,
    auth: request.auth,
    permission: 'ads.factoidRemove.allow'
  });

  return reply(promise);
}

/**
  * @apiVersion 0.4.0
  * @apiGroup Ads
  * @api {DELETE} /ads/factoids/:id Remove Factoid
  * @apiName RemoveFactoidAds
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to remove a factoid
  *
  * @apiParam {string} id The unique id of the factoid to remove
  *
  * @apiSuccess {object} HTTP Code STATUS 200 OK
  *
  * @apiError (Error 500) InternalServerError There was error removing the factoid
  */
module.exports = {
  method: 'DELETE',
  path: '/api/ads/factoids/{id}',
  config: {
    auth: { strategy: 'jwt' },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: auth } ]
  },
  handler: function(request, reply) {
    var factoidId = request.params.id;
    var promise = db.factoids.remove(factoidId)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
