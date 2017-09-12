var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db'));
var helper = dbc.helper;
var db = dbc.db;

module.exports = function(username, ignoredUsername, limit) {
  var q = 'SELECT id, username FROM users WHERE username LIKE $1 AND username != $2 ORDER BY username LIMIT $3';
  return db.sqlQuery(q, [username + '%', ignoredUsername, limit || 25])
  .then(helper.slugify);
};
