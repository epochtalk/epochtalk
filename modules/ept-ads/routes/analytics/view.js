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
  return promise;
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
  return roundNumber;
}

/**
  * @apiVersion 0.4.0
  * @apiGroup Ads
  * @api {GET} /ads/analytics/:round Ad Analytics
  * @apiName AnalyticsAds
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Returns analytics for the current ad round
  *
  * @apiSuccess {object} round Object containing data about the round
  * @apiSuccess {number} round.viewing The round of ads that analytics are being displayed for
  * @apiSuccess {number} round.current The round of ads that are currentlying running
  * @apiSuccess {number} round.previous The previous round
  * @apiSuccess {number} round.next The next round
  * @apiSuccess {timestamp} round.start_time The timestamp of when the round started
  * @apiSuccess {timestamp} round.end_time The timestamp of when the round ended
  * @apiSuccess {object[]} analytics Object containing analytics data about each ad in the round, index of ad corresponds the ad number
  * @apiSuccess {number} analytics.total_impressions The total number of impressions for this ad
  * @apiSuccess {number} analytics.total_authed_impressions The total number of impressions for this ad from authorized users (not unique)
  * @apiSuccess {number} analytics.total_unique_ip_impressions The total number of impressions for this ad from unique ip addresses
  * @apiSuccess {number} analytics.total_unique_authed_users_impressions The total number of impressions for this ad from authorized users (unique)
  *
  * @apiError (Error 500) InternalServerError There was an error viewing the analytics for ads
  */
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
          start_time: roundInfo.start_time,
          end_time: roundInfo.end_time
        },
        analytics: views
      };
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
