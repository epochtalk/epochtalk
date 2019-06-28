var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(userId) {
  userId = helper.deslugify(userId);
  var existsQuery = 'SELECT EXISTS (SELECT user_id_trusted FROM trust WHERE user_id = $1)';
  var result;
  return db.scalar(existsQuery, [userId])
  .then(function(row) {
    var exists = row.exists;
    var defaultTrustId = '537d639c-3b50-4545-bea1-8b38accf408e';
    var q = 'SELECT user_id_trusted, (SELECT username FROM users WHERE id = user_id_trusted) as username_trusted, type FROM trust WHERE user_id = $1 ORDER BY type, user_id_trusted';
    var defaultTrustQuery = 'SELECT id as user_id_trusted, username as username_trusted, 0 as type FROM users WHERE id = $1';
    // User has trust network
    if (exists) {
      return db.sqlQuery(q, [userId]);
    }
    // user has no trust network default to defaulttrustacct
    else { return db.sqlQuery(defaultTrustQuery, [defaultTrustId]); }
  })
  .then(helper.slugify)
  .then(function(list) {
    result = {
      trustList: list.filter(function(e) { return e.type === 0; }),
      untrustList: list.filter(function(e) { return e.type === 1; })
    };
    var q = 'SELECT max_depth FROM trust_max_depth WHERE user_id = $1';
    return db.scalar(q, [userId]);
  })
  .then(function(row) {
    result.maxDepth = row && row.max_depth >= 0 && row.max_depth <= 4 ? row.max_depth : 2;
    return result;
  });
};
