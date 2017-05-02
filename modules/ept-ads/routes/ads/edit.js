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
    permission: 'ads.edit.allow'
  });

  return reply(promise);
}


/**
  * @apiVersion 0.4.0
  * @apiGroup Ads
  * @api {PUT} /ads/:id Update Ad
  * @apiName UpdateAds
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to update an ad
  *
  * @apiParam {string} id The unique id of the ad to update
  * @apiParam (Payload) {string} html The updated html source
  * @apiParam (Payload) {string} css The updated css source
  *
  * @apiSuccess {string} id The unique id of the ad to update
  * @apiSuccess {string} html The updated html source
  * @apiSuccess {string} css The updated css source
  *
  * @apiError (Error 500) InternalServerError There was error updating the ad
  */
module.exports = {
  method: 'PUT',
  path: '/api/ads/{id}',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      params: { id: Joi.string().required() },
      payload: {
        html: Joi.string().required(),
        css: Joi.string().allow('')
      }
    },
    pre: [ { method: auth } ]
  },
  handler: function(request, reply) {
    var ad = request.payload;
    ad.id = request.params.id;
    var promise = db.ads.edit(ad)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
