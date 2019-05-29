var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var blacklistAll = require(path.normalize(__dirname + '/all'));

module.exports = function(ruleId) {
  ruleId = helper.deslugify(ruleId);
  var q = 'DELETE FROM blacklist WHERE id = $1 RETURNING ip_data, note';
  var params = [ruleId];
  var result = {};
  return db.sqlQuery(q, params)
  .then(function(results) { result.rule = results[0]; })
  .then(blacklistAll)
  .then(function(blacklist) {
    result.blacklist = blacklist;
    return result;
  });
};
