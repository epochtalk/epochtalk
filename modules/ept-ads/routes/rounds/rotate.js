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
    permission: 'ads.roundRotate.allow'
  });

  return reply(promise);
}

/**
  * @apiVersion 0.4.0
  * @apiGroup Ads
  * @api {POST} /ads/rounds/rotate Rotate Ad Round
  * @apiName RotateRoundAds
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to duplicate an ad within a round
  *
  * @apiParam (Payload) {number} round The round of ads to rotate to
  *
  * @apiSuccess {object} Sucess 200 OK
  *
  * @apiError (Error 500) InternalServerError There was an error rotating the ad round
  */
module.exports = {
  method: 'POST',
  path: '/api/ads/rounds/rotate',
  config: {
    auth: { strategy: 'jwt' },
    validate: { payload: { round: Joi.number().required() } },
    pre: [ { method: auth } ]
  },
  handler: function(request, reply) {
    var round = request.payload.round;
    var promise = db.rounds.rotate(round)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
