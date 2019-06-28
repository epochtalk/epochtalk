var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var blacklistAll = require(path.normalize(__dirname + '/all'));

module.exports = function(rule) {
  var q = 'INSERT INTO blacklist(ip_data, note) VALUES($1, $2)';
  var params = [rule.ip_data, rule.note];
  return db.sqlQuery(q, params)
  .then(blacklistAll);
};
