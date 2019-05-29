var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var blacklistAll = require(path.normalize(__dirname + '/all'));

module.exports = function(rule) {
  rule = helper.deslugify(rule);
  var q = 'UPDATE blacklist SET ip_data = $1, note = $2 WHERE id = $3';
  var params = [rule.ip_data, rule.note, rule.id];
  return db.sqlQuery(q, params)
  .then(blacklistAll);
};
