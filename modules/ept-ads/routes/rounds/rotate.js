var Joi = require('joi');
var Boom = require('boom');
var path = require('path');
var db = require(path.normalize(__dirname + '/../../db'));

function auth(request) {
  var promise = request.server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: request.server,
    auth: request.auth,
    permission: 'ads.roundRotate.allow'
  });

  return promise;
}

/**
  * @apiVersion 0.4.0
  * @apiGroup Ads
  * @api {POST} /ads/rounds/rotate Rotate Ad Round
  * @apiName RotateRoundAds
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to put a round of ads into rotation
  *
  * @apiParam (Payload) {number} round The round of ads to rotate to
  *
  * @apiSuccess {number} round The integer value of the round
  * @apiSuccess {boolean} current Boolean indicating if this is the current round
  * @apiSuccess {timestamp} start_time Start of the round timestamp
  * @apiSuccess {timestamp} end_time End of the round timestamp
  *
  * @apiError (Error 500) InternalServerError There was an error rotating the ad round
  */
module.exports = {
  method: 'POST',
  path: '/api/ads/rounds/rotate',
  options: {
    auth: { strategy: 'jwt' },
    validate: { payload: { round: Joi.number().required() } },
    pre: [ { method: auth } ]
  },
  handler: function(request) {
    var round = request.payload.round;
    var promise = db.rounds.rotate(round)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
