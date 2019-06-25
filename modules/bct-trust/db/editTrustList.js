var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var Promise = require('bluebird');

module.exports = function(opts) {
  var userId = helper.deslugify(opts.userId);
  var trustArray = opts.list || [];
  var trustedIds = trustArray.map(function(u) { return helper.deslugify(u.user_id_trusted); });
  var q, result;
  if (trustedIds.length) {
    q = 'DELETE FROM trust WHERE user_id = $1 AND user_id_trusted NOT IN (\'' + trustedIds.join('\',\'') + '\')';
  }
  else { q = 'DELETE FROM trust WHERE user_id = $1'; }
  return db.sqlQuery(q, [userId])
  .then(function() {
    q = 'WITH upsert AS (UPDATE trust SET type = $3 WHERE user_id = $1 AND user_id_trusted = $2 RETURNING *) INSERT INTO trust (user_id, user_id_trusted, type) SELECT $1, $2, $3 WHERE NOT EXISTS (SELECT * FROM upsert)';
    return Promise.each(trustArray, function(trustInfo) {
      var userIdTrusted = helper.deslugify(trustInfo.user_id_trusted);
      var type = trustInfo.type;
      return db.sqlQuery(q, [userId, userIdTrusted, type]);
    });
  })
  .then(function() {
    if (trustArray.length) {
      return trustArray;
    }
    else {
      var defaultTrustId = '537d639c-3b50-4545-bea1-8b38accf408e';
      var defaultTrustQuery = 'SELECT id as user_id_trusted, username as username_trusted, 0 as type FROM users WHERE id = $1';
      return db.sqlQuery(defaultTrustQuery, [defaultTrustId])
      .then(helper.slugify);
    }
  })
  .then(function(list) {
    result = {
      trustList: list.filter(function(e) { return e.type === 0; }),
      untrustList: list.filter(function(e) { return e.type === 1; })
    };
    q = 'INSERT INTO trust_max_depth (user_id, max_depth) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET max_depth = $2';
    return db.sqlQuery(q, [userId, opts.maxDepth]);
  })
  .then(function() {
    result.maxDepth = opts.maxDepth;
    return result;
  });
};
