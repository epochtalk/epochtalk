var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(role) {
  role.id = helper.deslugify(role.id);
  role.permissions = JSON.stringify(role.permissions);
  var q = 'UPDATE roles SET name = $1, description = $2, lookup = $3, priority = $4, highlight_color = $5, permissions = $6, updated_at = now() WHERE id = $7 RETURNING id, lookup';
  var params = [role.name, role.description, role.lookup, role.priority, role.highlight_color || role.highlightColor, role.permissions, role.id];
  return db.scalar(q, params)
  .then(helper.slugify);
};
