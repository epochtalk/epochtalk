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
    permission: 'ads.duplicate.allow'
  });

  return promise;
}


/**
  * @apiVersion 0.4.0
  * @apiGroup Ads
  * @api {POST} /ads/:id/duplicate Duplicate Ad
  * @apiName DuplicateAds
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to duplicate an ad within a round
  *
  * @apiParam {string} id The unique id of the ad to duplicate
  *
  * @apiSuccess {id} id The id of the duplicated ad
  * @apiSuccess {string} round The round in which the ad was created
  * @apiSuccess {string} html The html source for the ad
  * @apiSuccess {string} css The css source for the ad
  * @apiSuccess {timestamp} created_at The created at timestamp for the ad
  * @apiSuccess {timestamp} updated_at The updated at timestamp for the ad
  *
  * @apiError (Error 500) InternalServerError There was an error duplicating the ad
  */
module.exports = {
  method: 'POST',
  path: '/api/ads/{id}/duplicate',
  options: {
    auth: { strategy: 'jwt' },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: auth } ]
  },
  handler: function(request, reply) {
    var adId = request.params.id;
    var promise = db.ads.duplicate(adId)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
