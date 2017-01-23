var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db'));
var helper = dbc.helper;
var db = dbc.db;

module.exports = function(username, limit) {
  var q = 'SELECT id, username FROM users WHERE username LIKE $1 ORDER BY username LIMIT $2';
  return db.sqlQuery(q, [username + '%', limit || 25])
  .then(helper.slugify);
};
