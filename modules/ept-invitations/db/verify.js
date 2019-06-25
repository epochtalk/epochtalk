var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;

module.exports = function(user) {
  var q = 'SELECT email FROM invitations WHERE hash = $1 AND email = $2';
  return db.sqlQuery(q, [user.hash, user.email])
  .then(function(rows) {
    if (rows.length > 0) { return true; }
    else { return false; }
  });
};
