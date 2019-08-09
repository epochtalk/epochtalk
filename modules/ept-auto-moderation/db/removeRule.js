var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(ruleId) {
  ruleId = helper.deslugify(ruleId);
  var q = `DELETE FROM auto_moderation WHERE id = $1`;
  return db.sqlQuery(q, [ruleId])
  .then(function() { return { id: ruleId}; })
  .then(helper.slugify);
};
