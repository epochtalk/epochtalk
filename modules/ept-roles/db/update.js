var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(role) {
  role.id = helper.deslugify(role.id);
  var q, params;
  if (role.permissions) {
    role.permissions = JSON.stringify(role.permissions);
    q = 'UPDATE roles SET name = $1, description = $2, lookup = $3, priority = $4, highlight_color = $5, permissions = $6, updated_at = now() WHERE id = $7 RETURNING id, lookup';
    params = [role.name, role.description, role.lookup, role.priority, role.highlight_color || role.highlightColor, role.permissions, role.id];
  }
  else {
    role.custom_permissions = JSON.stringify(role.custom_permissions);
    q = 'UPDATE roles SET name = $1, description = $2, lookup = $3, priority = $4, highlight_color = $5, custom_permissions = $6, updated_at = now() WHERE id = $7 RETURNING id, lookup';
    params = [role.name, role.description, role.lookup, role.priority, role.highlight_color || role.highlightColor, role.custom_permissions, role.id];
  }
  return db.scalar(q, params)
  .then(helper.slugify);
};
