var Joi = require('@hapi/joi');
var Boom = require('boom');
var path = require('path');
var crypto = require('crypto');
var Promise = require('bluebird');
var db = require(path.normalize(__dirname + '/../../db'));
var adText = require(path.normalize(__dirname + '/../../text'));

function auth(request) {
  var promise = request.server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: request.server,
    auth: request.auth,
    permission: 'ads.roundView.allow'
  });

  return promise;
}

function defaultRoundNumber(request, h) {
  var roundNumber = request.params.roundNumber || h.continue;
  if (roundNumber === 'current') {
    return db.rounds.current()
    .then(function(round) {
      request.params.roundNumber = round;
      return round;
    })
    .then(function(round) {
      if (round) { return round; }
      else {
        return db.rounds.max()
        .tap(function(maxRound) {
          request.params.roundNumber = maxRound;
          return maxRound;
        });
      }
    });
  }
  return roundNumber;
}

/**
  * @apiVersion 0.4.0
  * @apiGroup Ads
  * @api {GET} /ads/rounds/:roundNumber View Ad Round
  * @apiName ViewRoundAds
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Returns ads, factoids, and data for specified round
  *
  * @apiParam {string} roundNumber The round number to view, or "current" to view current round
  * @apiParam (Query) {string="disclaimer","info","both"} [type] What html source text to bring back with the data
  *
  * @apiSuccess {object[]} ads An array of ads in the specified round
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
  * @apiSuccess {object} text Object which contains ad disclaimers and informations
  * @apiSuccess {string} text.info HTML source for ad info to be displayed
  * @apiSuccess {string} text.disclaimer HTML source for ads disclaimer to be displayed
  * @apiSuccess {object} round Object containing data about the round
  * @apiSuccess {number} round.viewing The round of ads that analytics are being displayed for
  * @apiSuccess {number} round.current The round of ads that are currentlying running
  * @apiSuccess {number} round.previous The previous round
  * @apiSuccess {number} round.next The next round
  *
  * @apiError (Error 500) InternalServerError There was an error viewing the round
  */
module.exports = {
  method: 'GET',
  path: '/api/ads/rounds/{roundNumber}',
  options: {
    auth: { strategy: 'jwt' },
    validate: {
      params: Joi.object({
        roundNumber: Joi.alternatives(Joi.number().min(1), Joi.string().valid('current'))
      }),
      query: Joi.object({
        type: Joi.string().valid('disclaimer', 'info', 'both')
      })
    },
    pre: [
      { method: auth },
      { method: defaultRoundNumber }
    ]
  },
  handler: function(request) {
    var roundNumber = request.params.roundNumber || 0;
    var pKey = request.server.app.config.privateKey;
    var type = request.query.type;

    var text = {};
    if (type === 'disclaimer') { text.disclaimer = adText.getDisclaimer(); }
    else if (type === 'info') { text.info = adText.getInfo(); }
    else if (type === 'both') {
      text.disclaimer = adText.getDisclaimer();
      text.info = adText.getInfo();
    }

    var getCurrentAds = db.ads.byRound(roundNumber);
    var getAllFactoids = db.factoids.all();
    var getCurrentRound = db.rounds.current();
    var getNextRound = db.rounds.next(roundNumber);
    var getPreviousRound = db.rounds.previous(roundNumber);

    var promise = Promise.join(getCurrentAds, getAllFactoids, getCurrentRound, getNextRound, getPreviousRound, function(ads, factoids, current, next, previous) {
      return {
        ads: ads,
        factoids: factoids,
        text: text,
        rounds: {
          viewing: roundNumber,
          current: current,
          next: next,
          previous: previous
        }
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
