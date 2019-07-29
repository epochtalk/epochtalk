var Joi = require('joi');
var Boom = require('boom');
var path = require('path');
var adText = require(path.normalize(__dirname + '/../../text'));

function auth(request, reply) {
  var promise = request.server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: request.server,
    auth: request.auth,
    permission: 'ads.textSave.allow'
  });

  return promise;
}

/**
  * @apiVersion 0.4.0
  * @apiGroup Ads
  * @api {POST} /ads/text Save Ad View Text
  * @apiName SaveAds
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to save ad info and disclaimer text to be displayed in Ad related views
  *
  * @apiParam (Payload) {string} disclaimer The disclaimer text html source for ads
  * @apiParam (Payload) {string} info The information text html source for ads
  *
  * @apiSuccess {string} disclaimer The disclaimer text html source for ads
  * @apiSuccess {string} info The information text html source for ads
  *
  * @apiError (Error 500) InternalServerError There was an error saving the ad view text
  */
module.exports = {
  method: 'POST',
  path: '/api/ads/text',
  options: {
    auth: { strategy: 'jwt' },
    validate: {
      payload: {
        disclaimer: Joi.string().allow(''),
        info: Joi.string().allow('')
      }
    },
    pre: [ { method: auth } ]
  },
  handler: function(request, reply) {
    var text = request.payload;
    adText.setDisclaimer(text.disclaimer);
    adText.setInfo(text.info);
    return text;
  }
};
