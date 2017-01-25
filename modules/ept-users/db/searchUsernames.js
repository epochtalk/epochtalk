var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;

/* returns array of usernames matching searchStr */
module.exports = function(searchStr, limit) {
  var q = 'SELECT username FROM users WHERE username LIKE $1 ORDER BY username LIMIT $2';
  var params = [searchStr + '%', limit || 15];
  return db.sqlQuery(q, params)
  .map(function(user) { return user.username; });
};
