var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var errors = dbc.errors;
var CreationError = errors.CreationError;

module.exports = function(rule) {
  var q = `
    INSERT INTO auto_moderation (
      name,
      description,
      message,
      conditions,
      actions,
      options,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, now(), now())
    RETURNING id
  `;
  return db.sqlQuery(q, [rule.name, rule.description, rule.message, JSON.stringify(rule.conditions), JSON.stringify(rule.actions), rule.options])
  .then(function(rows) {
    if (rows.length > 0) {
      rule.id = rows[0].id;
      return rule;
    }
    else { throw new CreationError('Could not create rule'); }
  })
  .then(helper.slugify);
};
