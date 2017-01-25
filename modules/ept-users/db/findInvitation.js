var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;

module.exports = function(email) {
  var q = 'SELECT email, hash, created_at FROM invitations WHERE email = $1';
  return db.sqlQuery(q, [email])
  .then(function(rows) {
    if (rows.length > 0) { return rows[0]; }
    else { return undefined; }
  });
};
