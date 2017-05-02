var _ = require('lodash');
var path = require('path');
var Boom = require('boom');
var crypto = require('crypto');
var Promise = require('bluebird');
var db = require(path.normalize(__dirname + '/../../db'));
var adText = require(path.normalize(__dirname + '/../../text'));

function auth(request, reply) {
  var promise = request.server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: request.server,
    auth: request.auth,
    permission: 'ads.view.allow'
  });

  return reply(promise);
}

/**
  * @apiVersion 0.4.0
  * @apiGroup Ads
  * @api {GET} /ads/ View Ad
  * @apiName ViewAds
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Returns a random ad out of the round of circulated ads
  *
  * @apiSuccess {string} id The id of the ad
  * @apiSuccess {string} round The round in which the ad is running
  * @apiSuccess {string} html The html source for the ad
  * @apiSuccess {string} css The css source for the ad
  * @apiSuccess {timestamp} created_at The created at timestamp for the ad
  * @apiSuccess {timestamp} updated_at The updated at timestamp for the ad
  *
  * @apiError (Error 500) InternalServerError There was error viewing the ad
  */
module.exports = {
  method: 'GET',
  path: '/api/ads',
  config: {
    auth: {  mode: 'try', strategy: 'jwt' },
    pre: [ { method: auth } ]
  },
  handler: function(request, reply) {
    // check if user is logged in
    var userId;
    var pKey = request.server.app.config.privateKey;
    if (request.auth.isAuthenticated) { userId = request.auth.credentials.id; }
    var userIp =  request.headers['x-forwarded-for'] || request.info.remoteAddress;

    // get current ads and factoid
    var getAds = db.ads.current();
    var getFactoid = db.factoids.random();

    var promise = Promise.join(getAds, getFactoid, function(ads, factoid) {
      var selection = ads;

      if (factoid) {
        factoid = { type: 'factoid', data: factoid };
        selection = ads.concat(factoid);
      }

      // randomize from results
      return _.sample(selection);
    })
    // record ad view
    .then(function(ad) {
      if (!ad) { return { error: 'no ads found'}; }

      // record view for factoid
      if (ad.type === 'factoid') {
        db.analytics.factoids.update(userId, userIp);
      }
      // record view for ad
      else {
        db.analytics.ads.update(ad.id, userId, userIp);
      }

      return ad;
    })
    // template ad css with random hash
    .then(function(ad) {
      if (!ad.css) { return ad; }
      var time = Date.now().toString();
      var randomHash = crypto.createHash('md5').update(time).update(pKey).digest('hex');
      randomHash = randomHash.replace(/\d/g, function(match) {
        return String.fromCharCode(97 + Number(match));
      });
      ad.css = ad.css.replace('${hash}', randomHash);
      ad.html = ad.html.replace('${hash}', randomHash);
      return ad;
    })
    // add ad disclaimer
    .then(function(ad) {
      ad.disclaimer = adText.getDisclaimer();
      return ad;
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
