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
    permission: 'ads.remove.allow'
  });

  return reply(promise);
}

/**
  * @apiVersion 0.4.0
  * @apiGroup Ads
  * @api {DELETE} /ads/:id Remove Ad
  * @apiName RemoveAds
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to remove an ad
  *
  * @apiParam {string} id The unique id of the ad to remove
  *
  * @apiSuccess {object} HTTP Code STATUS 200 OK
  *
  * @apiError (Error 500) InternalServerError There was error removing the ad
  */
module.exports = {
  method: 'DELETE',
  path: '/api/ads/{id}',
  config: {
    auth: { strategy: 'jwt' },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: auth } ]
  },
  handler: function(request, reply) {
    var adId = request.params.id;
    var promise = db.ads.remove(adId)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
