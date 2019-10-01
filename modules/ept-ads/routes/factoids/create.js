var Joi = require('@hapi/joi');
var Boom = require('boom');
var path = require('path');
var db = require(path.normalize(__dirname + '/../../db'));

function auth(request) {
  var promise = request.server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: request.server,
    auth: request.auth,
    permission: 'ads.factoidCreate.allow'
  });

  return promise;
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
  * @apiError (Error 500) InternalServerError There was an error creating the factoid
  */
module.exports = {
  method: 'POST',
  path: '/api/ads/factoids',
  options: {
    auth: { strategy: 'jwt' },
    validate: { payload: Joi.object({ text: Joi.string().required() }) },
    pre: [ { method: auth } ]
  },
  handler: function(request) {
    var factoid = request.payload;
    var promise = db.factoids.create(factoid)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
