var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var addAddresses = require(path.normalize(__dirname + '/addAddresses'));

module.exports = function(opts) {
  var userId = helper.deslugify(opts.userId);
  var weight = opts.weight || 50;
  var decay = opts.decay === false ? false : true;
  var q = 'SELECT user_ip FROM users.ips WHERE user_id = $1';
  return db.sqlQuery(q, [ userId ])
  .map(function(info) { return { ip: info.user_ip, weight: weight, decay: decay }; })
  .then(function(addresses) { return addAddresses(addresses); });
};
