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
    permission: 'ads.create.allow'
  });

  return promise;
}

/**
  * @apiVersion 0.4.0
  * @apiGroup Ads
  * @api {POST} /ads Create Ad
  * @apiName CreateAds
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to create a new ad within a round
  *
  * @apiParam (Payload) {number} round The number of the round to create ad for
  * @apiParam (Payload) {string} html The html source of the ad
  * @apiParam (Payload) {string} [css] The css backing the html source
  *
  * @apiSuccess {string} id The id of the created ad
  * @apiSuccess {number} round The round in which the ad was created
  * @apiSuccess {string} html The html source for the ad
  * @apiSuccess {string} css The css source for the ad
  *
  * @apiError (Error 500) InternalServerError There was an error creating the ad
  */
module.exports = {
  method: 'POST',
  path: '/api/ads',
  options: {
    auth: { strategy: 'jwt' },
    validate: {
      payload: Joi.object({
        round: Joi.number().required(),
        html: Joi.string().required(),
        css: Joi.string().allow('')
      })
    },
    pre: [ { method: auth } ]
  },
  handler: function(request) {
    var ad = request.payload;
    var promise = db.ads.create(ad)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
