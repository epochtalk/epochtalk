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
    permission: 'ads.factoidEdit.allow'
  });

  return reply(promise);
}


/**
  * @apiVersion 0.4.0
  * @apiGroup Ads
  * @api {PUT} /ads/factoids/:id Update Factoid
  * @apiName UpdateFactoidAds
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to update a factoid
  *
  * @apiParam {string} id The unique id of the factoid to update
  * @apiParam (Payload) {string} text The updated factoid text
  *
  * @apiSuccess {string} id The unique id of the factoid which was update
  * @apiSuccess {string} text The updated factoid text
  *
  * @apiError (Error 500) InternalServerError There was error updating the factoid
  */
module.exports = {
  method: 'PUT',
  path: '/api/ads/factoids/{id}',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      params: { id: Joi.string().required() },
      payload: { text: Joi.string().required() }
    },
    pre: [ { method: auth } ]
  },
  handler: function(request, reply) {
    var factoid = request.payload;
    factoid.id = request.params.id;
    var promise = db.factoids.edit(factoid)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
