var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var trustSources = require(path.normalize(__dirname + '/trustSources'));
var getTrustStats = require(path.normalize(__dirname + '/getTrustStats'));
var helper = dbc.helper;

module.exports = function(userId, authedUserId) {
  if (!userId) { return Promise.resolve({ sent:[], trusted: [], untrusted:[] }); }
  userId = helper.deslugify(userId);

  var trusted;
  var result = {};

  var maxDepthQ = 'SELECT max_depth FROM trust_max_depth WHERE user_id = $1';
  return db.scalar(maxDepthQ, [helper.deslugify(authedUserId)])
  .then(function(row) {
    var maxDepth = row && row.max_depth >= 0 && row.max_depth <= 4 ? row.max_depth : 2;
    return trustSources(authedUserId, maxDepth);
  })
  // Get list of authenticated users trusted sources
  .then(function(trustedSources) {
    trusted = trustedSources;
    var q = 'SELECT id, reporter_id, (SELECT u.username FROM users u WHERE u.id = reporter_id) as reporter_username, risked_btc, reference, comments, created_at, scammer FROM trust_feedback WHERE user_id = $1 AND reporter_id = ANY($2) ORDER BY created_at DESC';
    return db.sqlQuery(q, [userId, trusted]);
  })
  .map(function(trustedItem) {
    return getTrustStats(helper.slugify(trustedItem.reporter_id), authedUserId, trusted)
    .then(function(stats) {
      trustedItem.reporter = {
        id: trustedItem.reporter_id,
        username: trustedItem.reporter_username,
        stats: stats
      };
      delete trustedItem.reporter_id;
      delete trustedItem.reporter_username;
      return trustedItem;
    });
  })
  .then(function(trustedFeedback) {
    result.trusted = trustedFeedback || [];
    var q = 'SELECT id, reporter_id, (SELECT u.username FROM users u WHERE u.id = reporter_id) as reporter_username, risked_btc, reference, comments, created_at, scammer FROM trust_feedback WHERE user_id = $1 AND NOT (reporter_id = ANY($2)) ORDER BY created_at DESC';
    return db.sqlQuery(q, [userId, trusted]);
  })
  .map(function(untrustedItem) {
    return getTrustStats(helper.slugify(untrustedItem.reporter_id), authedUserId, trusted)
    .then(function(stats) {
      untrustedItem.reporter = {
        id: untrustedItem.reporter_id,
        username: untrustedItem.reporter_username,
        stats: stats
      };
      delete untrustedItem.reporter_id;
      delete untrustedItem.reporter_username;
      return untrustedItem;
    });
  })
  .then(function(untrustedFeedback) {
    result.untrusted = untrustedFeedback || [];
    var q = 'SELECT id, user_id, (SELECT u.username FROM users u WHERE u.id = user_id) as username, risked_btc, reference, comments, created_at, scammer FROM trust_feedback WHERE reporter_id = $1 ORDER BY created_at DESC';
    return db.sqlQuery(q, [userId]);
  })
  .map(function(sentItem) {
    return getTrustStats(helper.slugify(sentItem.user_id), authedUserId, trusted)
    .then(function(stats) {
      sentItem.user = {
        id: sentItem.user_id,
        username: sentItem.username,
        stats: stats
      };
      delete sentItem.user_id;
      delete sentItem.username;
      return sentItem;
    });
  })
  .then(function(sentFeedback) {
    result.sent = sentFeedback || [];
    return result;
  })
  .then(helper.slugify);
};
