var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(id) {
  id = helper.deslugify(id);
  var q = 'SELECT array_agg(user_ip) as ips FROM users.ips WHERE user_id = $1';
  return db.scalar(q, [ id ])
  .then(function(results) { return results.ips; });
};
