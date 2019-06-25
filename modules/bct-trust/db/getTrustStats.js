var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var trustSources = require(path.normalize(__dirname + '/trustSources'));
var helper = dbc.helper;
var Promise = require('bluebird');

module.exports = function(userId, authedUserId, authTrustedSources) {
  if (!userId) { return Promise.resolve({ neg:0, pos:0, score:0 }); }

  userId = helper.deslugify(userId);
  var trusted, uniqueNegFeedback, uniquePosFeedback;

  var maxDepthQ = 'SELECT max_depth FROM trust_max_depth WHERE user_id = $1';
  return db.scalar(maxDepthQ, [helper.deslugify(authedUserId)])
  .then(function(row) {
    var maxDepth = row && row.max_depth >= 0 && row.max_depth <= 4 ? row.max_depth : 2;
    var trustedSourcesPromise = trustSources(authedUserId, maxDepth);
    // Don't calculate trusted sources if they are passed in
    if (authTrustedSources) {
      trustedSourcesPromise = new Promise(function(resolve) { resolve(authTrustedSources); });
    }
    // Get list of authenticated users trusted sources
    return trustedSourcesPromise;
  })
  // Select negative feedback left on this user by authed user's trusted sources
  .then(function(trustedSources) {
    trusted = trustedSources;
    var uniqueNegQ = 'SELECT count(distinct reporter_id)::int FROM trust_feedback WHERE user_id = $1 AND scammer = true AND reporter_id = ANY($2)';
    return db.scalar(uniqueNegQ, [userId, trusted]);
  })
  // Select positive feedback left on this user by authed user's trusted sources
  .then(function(row) {
    uniqueNegFeedback = row.count;
    var uniquePosQ = 'SELECT count(distinct reporter_id)::int FROM trust_feedback WHERE user_id = $1 AND scammer = false AND reporter_id = ANY($2)';
    return db.scalar(uniquePosQ, [userId, trusted]);
  })
  .then(function(row) {
    uniquePosFeedback = row.count;
    if (uniqueNegFeedback === 0) {
      var scoreQ = 'SELECT FLOOR(SUM(LEAST(10,date_part(\'epoch\', (now()-created_at)/(60*60*24*30))::int))) as score FROM trust_feedback e JOIN (SELECT id FROM trust_feedback f JOIN (SELECT min(created_at) as created_at, reporter_id FROM trust_feedback WHERE user_id = $1 AND scammer = false AND reporter_id = ANY($2) GROUP BY reporter_id) g on f.created_at = g.created_at AND f.reporter_id = g.reporter_id) i ON e.id = i.id';
      return db.scalar(scoreQ, [userId, trusted])
      .then(function(row) { return row.score || 0; });
    }
    else {
      var score = uniquePosFeedback - Math.pow(2, uniqueNegFeedback);
      if (score >= 0) {
        var startTime, negSince, posSince;
        var startTimeQ = 'SELECT created_at FROM trust_feedback WHERE user_id = $1 AND scammer = true AND reporter_id = ANY($2) ORDER BY created_at ASC LIMIT 1';
        return db.scalar(startTimeQ, [userId, trusted])
        .then(function(row) {
          startTime = row.created_at;
          var negSinceQ = 'SELECT count(DISTINCT reporter_id) FROM trust_feedback WHERE user_id = $1 AND scammer = true AND created_at >= $2 AND reporter_id = ANY($3)';
          return db.scalar(negSinceQ, [userId, startTime, trusted]);
        })
        .then(function(row) {
          negSince = row.count;
          var posSinceQ = 'SELECT count(DISTINCT reporter_id) FROM trust_feedback WHERE user_id = $1 AND scammer = false AND created_at >= $2 AND reporter_id = ANY($3)';
          return db.scalar(posSinceQ, [userId, startTime, trusted]);
        })
        .then(function(row) {
          posSince = row.count;

          score = posSince - negSince;
          if (score < 0) { score = '???'; }
          if (score !== '???') {
            score = Math.floor(score);
            score = Math.min(9999, score);
            score = Math.max(-9999, score);
          }
          return score;
        });
      }
      if (score !== '???') {
        score = Math.floor(score);
        score = Math.min(9999, score);
        score = Math.max(-9999, score);
      }
      return score;
    }
  })
  .then(function(score) {
    return {
      score: score,
      neg: uniqueNegFeedback,
      pos: uniquePosFeedback
    };
  });
};
