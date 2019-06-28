var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;

module.exports = function() {
  var defaultTrustUser = {
    id: '537d639c-3b50-4545-bea1-8b38accf408e',
    username: 'DefaultTrustList',
    email: 'DefaultTrustList@DefaultTrustList'
  };

  var q = `INSERT INTO users(id, email, username, created_at, updated_at)
           VALUES ($1, $2, $3, now(), now())
           ON CONFLICT (id)
           DO UPDATE SET
           email = EXCLUDED.email,
           username = EXCLUDED.username,
           updated_at = EXCLUDED.updated_at`;

  var params = [
    defaultTrustUser.id,
    defaultTrustUser.email,
    defaultTrustUser.username
  ];

  return db.sqlQuery(q, params);
};
