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
