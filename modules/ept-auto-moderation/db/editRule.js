var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(rule) {
  rule = helper.deslugify(rule);

  var q = `
    UPDATE auto_moderation SET (
      name,
      description,
      message,
      conditions,
      actions,
      options,
      updated_at
    ) = ($2, $3, $4, $5, $6, $7, now())
    WHERE id = $1
  `;
  return db.sqlQuery(q, [rule.id, rule.name, rule.description, rule.message, JSON.stringify(rule.conditions), JSON.stringify(rule.actions), rule.options])
  .then(function() { return rule; })
  .then(helper.slugify);
};
