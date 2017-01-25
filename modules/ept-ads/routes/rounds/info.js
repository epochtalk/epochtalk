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

  return reply(promise);
}

function currentRound(request, reply) {
  var roundNumber = db.rounds.current();
  return reply(roundNumber);
}

module.exports = {
  method: 'GET',
  path: '/api/ads/rounds/info',
  config: {
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
    });

    return reply(promise);
  }
};
