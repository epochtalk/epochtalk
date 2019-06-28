var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(username, ignoredUsername, limit) {
  var q, promise;
  if (ignoredUsername) {
    q = 'SELECT id, username FROM users WHERE username LIKE $1 AND username != $2 ORDER BY username LIMIT $3';
    queryPromise = db.sqlQuery(q, [username + '%', ignoredUsername, limit || 25]);
  }
  else {
    q = 'SELECT id, username FROM users WHERE username LIKE $1 ORDER BY username LIMIT $2';
    queryPromise = db.sqlQuery(q, [username + '%', limit || 25]);
  }
  return queryPromise
  .then(helper.slugify);
};
