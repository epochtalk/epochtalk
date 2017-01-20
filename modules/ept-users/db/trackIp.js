var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(id, ip) {
  id = helper.deslugify(id);
  var q = 'INSERT INTO users.ips(user_id, user_ip, created_at) SELECT $1, $2::text, now() WHERE NOT EXISTS (SELECT user_id, user_ip FROM users.ips WHERE user_id = $1 AND user_ip = $2)';
  var params = [ id, ip ];
  return db.sqlQuery(q, params);
};
