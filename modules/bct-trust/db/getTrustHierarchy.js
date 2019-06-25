var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var Promise = require('bluebird');

var recursiveQ = function(userId, depth, maxDepth) {
  var out = [];

  var defaultTrustUserId = '537d639c-3b50-4545-bea1-8b38accf408e';

  if (maxDepth < depth || !userId) { return Promise.resolve([]); }

  var q = 'SELECT t.user_id_trusted, t.type, (SELECT username FROM users u WHERE u.id = t.user_id_trusted) as username_trusted FROM trust t WHERE t.user_id = $1';

  return db.sqlQuery(q, [userId])
  .then(function(trusted) {
    if (depth === 0 && trusted.length === 0) {
      var defaultTrustQ = 'SELECT username as username_trusted, id as user_id_trusted, 0 as type FROM users WHERE id = $1';
      return db.sqlQuery(defaultTrustQ, [defaultTrustUserId]);
    }
    else { return trusted; }
  })
  .each(function(userData) {
    return recursiveQ(userData.user_id_trusted, depth + 1, maxDepth)
    .then(function(output) {

      userData.trusted = output;
      out.push(userData);
    })
    .then(function() { return out; });
  });
};

module.exports = function(userId) {
  userId = helper.deslugify(userId);
  var maxDepthQ = 'SELECT max_depth FROM trust_max_depth WHERE user_id = $1';
  return db.scalar(maxDepthQ, [userId])
  .then(function(row) {
    var maxDepth = row && row.max_depth >= 0 && row.max_depth <= 4 ? row.max_depth : 2;
    var depth = 0;
    return recursiveQ(userId, depth, maxDepth);
  })
  .then(helper.slugify);
};

