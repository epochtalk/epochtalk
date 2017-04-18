var Joi = require('joi');
var Boom = require('boom');
var path = require('path');
var Promise = require('bluebird');
var db = require(path.normalize(__dirname + '/../../db'));

function auth(request, reply) {
  var promise = request.server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: request.server,
    auth: request.auth,
    permission: 'ads.analyticsView.allow'
  });
  return reply(promise);
}

function defaultRoundNumber(request, reply) {
  var roundNumber = request.params.round;
  if (roundNumber === 'current') {
    roundNumber = db.rounds.current()
    .tap(function(round) { request.params.round = round; })
    .then(function(round) {
      if (!round) {
        return db.rounds.max()
        .tap(function(maxRound) { request.params.round = maxRound; });
      }
    });
  }
  return reply(roundNumber);
}

module.exports = {
  method: 'GET',
  path: '/api/ads/analytics/{round}',
  config: {
    validate: {
      params: {
        round: Joi.alternatives(Joi.number().min(1), Joi.string().valid('current'))
      }
    },
    auth: {  mode: 'try', strategy: 'jwt' },
    pre: [
      { method: auth },
      { method: defaultRoundNumber }
    ]
  },
  handler: function(request, reply) {
    var round = request.params.round;

    // get current ads and factoid
    var getRoundInfo = db.rounds.find(round);
    var getAdViews = db.analytics.ads.views(round);
    var getFactoidViews = db.analytics.factoids.views(round);
    var getCurrentRound = db.rounds.current();
    var getNextRound = db.rounds.next(round);
    var getPreviousRound = db.rounds.previous(round);

    var promise = Promise.join(getRoundInfo, getAdViews, getFactoidViews, getCurrentRound, getNextRound, getPreviousRound, function(roundInfo, adViews, factoidViews, current, next, previous) {
      // randomize from results
      var views = adViews.concat(factoidViews);
      return {
        round: {
          viewing: round,
          current: current,
          next: next,
          previous: previous,
          startTime: roundInfo.start_time,
          endTime: roundInfo.end_time
        },
        analytics: views
      };
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
