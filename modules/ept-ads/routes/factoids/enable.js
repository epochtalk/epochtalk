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
    permission: 'ads.factoidEnable.allow'
  });

  return promise;
}

/**
  * @apiVersion 0.4.0
  * @apiGroup Ads
  * @api {PUT} /ads/factoids/:id/enable Enable Factoid
  * @apiName EnableFactoidsAds
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to enable factoids
  *
  * @apiParam {string} id The unique id of the factoid to enable, pass 'all' in to enable all factoids
  *
  * @apiSuccess {Object} Sucess 200 OK
  *
  * @apiError (Error 500) InternalServerError There was an error enabling the factoid
  */
module.exports = {
  method: 'PUT',
  path: '/api/ads/factoids/{id}/enable',
  config: {
    auth: { strategy: 'jwt' },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: auth } ]
  },
  handler: function(request, reply) {
    var promise;
    var factoidId = request.params.id;

    if (factoidId === 'all') {
      promise = db.factoids.enableAll()
      .error(request.errorMap.toHttpError);
    }
    else {
      promise = db.factoids.enable(factoidId)
      .error(request.errorMap.toHttpError);
    }

    return promise;
  }
};
