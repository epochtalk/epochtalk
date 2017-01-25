var path = require('path');
var db = require(path.normalize(__dirname + '/db')).db;

module.exports = function(username) {
  var q = 'SELECT p.post_count as count ' +
  'FROM users.profiles p JOIN users u ON(p.user_id = u.id) ' +
  'WHERE u.username = $1';
  var params = [username];
  return db.sqlQuery(q, params)
  .then(function(rows) {
    if (rows.length > 0) { return rows[0].count; }
    else { return 0; }
  });
};
