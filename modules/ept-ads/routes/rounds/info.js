var Boom = require('boom');
var path = require('path');
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
    permission: 'ads.roundInfo.allow'
  });

  return promise;
}

function currentRound(request, reply) {
  var roundNumber = db.rounds.current();
  return roundNumber;
}

/**
  * @apiVersion 0.4.0
  * @apiGroup Ads
  * @api {GET} /ads/rounds/info View Round Information
  * @apiName ViewRoundInfoAds
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Returns information about the current ad round
  *
  * @apiSuccess {object[]} ads An array of ads in the current round
  * @apiSuccess {string} ads.id The id of the ad
  * @apiSuccess {number} ads.round The round number of the ad
  * @apiSuccess {string} ads.html The html source for the ad
  * @apiSuccess {string} ads.css The css source for the ad
  * @apiSuccess {string} ads.display_html The compiled display html
  * @apiSuccess {string} ads.display_css The compiled display css
  * @apiSuccess {timestamp} ads.created_at The created at timestamp for the ad
  * @apiSuccess {timestamp} ads.updated_at The updated at timestamp for the ad
  * @apiSuccess {object[]} factoids An array of factoids in circulation
  * @apiSuccess {string} factoids.id The id of the factoid
  * @apiSuccess {string} factoids.text The factoid text
  * @apiSuccess {boolean} factoids.enabled Boolean indicating if factoid is enabled
  * @apiSuccess {timestamp} factoids.created_at The created at timestamp for the factoid
  * @apiSuccess {timestamp} factoids.updated_at The updated at timestamp for the factoid
  * @apiSuccess {object} text Object which contains info to be displayed on the /ads/info view
  * @apiSuccess {string} text.info HTML source to be displayed on the /ads/info view
  *
  * @apiError (Error 500) InternalServerError There was an error viewing the round information
  */
module.exports = {
  method: 'GET',
  path: '/api/ads/rounds/info',
  options: {
    auth: { strategy: 'jwt' },
    pre: [
      { method: auth },
      { method: currentRound, assign: 'currentRound' }
    ]
  },
  handler: function(request, reply) {
    var roundNumber = request.pre.currentRound;
    var pKey = request.server.app.config.privateKey;

    var text = { info: adText.getInfo() };
    var getCurrentAds = db.ads.byRound(roundNumber);
    var getAllFactoids = db.factoids.all({ enabledOnly: true});

    var promise = Promise.join(getCurrentAds, getAllFactoids, function(ads, factoids) {
      return {
        ads: ads,
        factoids: factoids,
        text: text
      };
    })
    .tap(function(retVal) {
      retVal.ads.map(function(ad) {
        if (!ad.css) {
          ad.display_html = ad.html;
          return ad;
        }
        var time = Date.now().toString();
        var randomHash = crypto.createHash('md5').update(time).update(pKey).digest('hex');
        randomHash = randomHash.replace(/\d/g, function(match) {
          return String.fromCharCode(97 + Number(match));
        });
        ad.display_css = ad.css.replace('${hash}', randomHash);
        ad.display_html = ad.html.replace('${hash}', randomHash);
        return ad;
      });
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
