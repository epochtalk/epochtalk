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
    permission: 'ads.factoidDisable.allow'
  });

  return reply(promise);
}

/**
  * @apiVersion 0.4.0
  * @apiGroup Ads
  * @api {PUT} /ads/factoids/:id/disable Disable Factoid
  * @apiName DisableFactoidsAds
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to disable factoids
  *
  * @apiParam {string} id The unique id of the factoid to disable, pass 'all' in to disable all factoids
  *
  * @apiSuccess {Object} Sucess 200 OK
  *
  * @apiError (Error 500) InternalServerError There was an error disabling the factoid
  */
module.exports = {
  method: 'PUT',
  path: '/api/ads/factoids/{id}/disable',
  config: {
    auth: { strategy: 'jwt' },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: auth } ]
  },
  handler: function(request, reply) {
    var promise;
    var factoidId = request.params.id;

    if (factoidId === 'all') {
      promise = db.factoids.disableAll()
      .error(request.errorMap.toHttpError);
    }
    else {
      promise = db.factoids.disable(factoidId)
      .error(request.errorMap.toHttpError);
    }

    return reply(promise);
  }
};
