var Joi = require('joi');
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
    permission: 'ads.roundView.allow'
  });

  return reply(promise);
}

function defaultRoundNumber(request, reply) {
  var roundNumber = request.params.roundNumber;
  if (roundNumber === 'current') {
    roundNumber = db.rounds.current()
    .tap(function(round) { request.params.roundNumber = round; })
    .then(function(round) {
      if (!round) {
        return db.rounds.max()
        .tap(function(maxRound) { request.params.roundNumber = maxRound; });
      }
    });
  }
  return reply(roundNumber);
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
  * @apiSuccess {string} ads.displayHtml The compiled display html
  * @apiSuccess {string} ads.displayCss The compiled display css
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
  * @apiError (Error 500) InternalServerError There was error viewing the round
  */
module.exports = {
  method: 'GET',
  path: '/api/ads/rounds/{roundNumber}',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      params: {
        roundNumber: Joi.alternatives(Joi.number().min(1), Joi.string().valid('current'))
      },
      query: {
        type: Joi.string().valid('disclaimer', 'info', 'both')
      }
    },
    pre: [
      { method: auth },
      { method: defaultRoundNumber }
    ]
  },
  handler: function(request, reply) {
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
          ad.displayHtml = ad.html;
          return ad;
        }
        var time = Date.now().toString();
        var randomHash = crypto.createHash('md5').update(time).update(pKey).digest('hex');
        randomHash = randomHash.replace(/\d/g, function(match) {
          return String.fromCharCode(97 + Number(match));
        });
        ad.displayCss = ad.css.replace('${hash}', randomHash);
        ad.displayHtml = ad.html.replace('${hash}', randomHash);
        return ad;
      });
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
