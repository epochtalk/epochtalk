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
    permission: 'ads.factoidCreate.allow'
  });

  return reply(promise);
}


/**
  * @apiVersion 0.4.0
  * @apiGroup Ads
  * @api {POST} /ads/factoids Create Factoid
  * @apiName CreateFactoidsAds
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to create a new factoid
  *
  * @apiParam (Payload) {string} text The factoid text
  *
  * @apiSuccess {string} id The id of the created factoid
  * @apiSuccess {string} text The factoid text
  *
  * @apiError (Error 500) InternalServerError There was error creating the factoid
  */
module.exports = {
  method: 'POST',
  path: '/api/ads/factoids',
  config: {
    auth: { strategy: 'jwt' },
    validate: { payload: { text: Joi.string().required() } },
    pre: [ { method: auth } ]
  },
  handler: function(request, reply) {
    var factoid = request.payload;
    var promise = db.factoids.create(factoid)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
