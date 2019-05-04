var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

/* returns user with added role(s) */
module.exports = function(role) {
  var q, params;
  var permissions = JSON.stringify(role.permissions);
  if (role.id) { // for hardcoded roles with ids, don't slugify id
    q = 'INSERT INTO roles (id, name, description, lookup, priority, highlight_color, permissions, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, now(), now()) RETURNING id';
    params = [role.id, role.name, role.description || '', role.lookup, role.priority, role.highlight_color || role.highlightColor, permissions];
    return db.scalar(q, params)
    .then(helper.slugify);
  }
  else { // for custom roles
    q = 'INSERT INTO roles (name, description, lookup, priority, highlight_color, permissions, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, now(), now()) RETURNING id';
    params = [role.name, role.description || '', role.name, role.priority, role.highlight_color || role.highlightColor, permissions];
    return using(db.createTransaction(), function(client) {
      return client.query(q, params)
      .then(function(results) {
        // Add Lookup as slugified id, guarantees uniqueness
        var row = results.rows[0];
        var addedRoleId = row.id;
        var slugifiedRow = helper.slugify(row);
        q = 'UPDATE roles SET lookup = $1 WHERE id = $2 RETURNING id';
        params = [slugifiedRow.id, addedRoleId];
        return client.query(q, params)
        .then(function(results) { return results.rows[0]; });
      });
    })
    .then(helper.slugify);
  }
};
