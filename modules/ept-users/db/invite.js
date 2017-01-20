var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;

module.exports = function(user) {
  var q, params;
  q = 'INSERT INTO invitations(email, hash, created_at) VALUES($1, $2, now())';
  params = [user.email, user.hash];
  return db.sqlQuery(q, params);
};
