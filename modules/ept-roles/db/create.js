var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var Promise = require('bluebird');
var using = Promise.using;

/* returns user with added role(s) */
module.exports = function(role) {
  var q, params;
  var basePermissions, customPermissions;
  if (role.permissions) { basePermissions = JSON.stringify(role.permissions); }
  if (role.custom_permissions) { customPermissions = JSON.stringify(role.custom_permissions); }
  if (role.id) { // for hardcoded roles with ids, don't slugify id
    params = [role.id, role.name, role.description || '', role.lookup, role.priority, role.highlight_color || role.highlightColor];
    if (basePermissions) {
      q = 'INSERT INTO roles (id, name, description, lookup, priority, highlight_color, base_permissions, custom_permissions, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now(), now()) RETURNING id';
      params.push(basePermissions);
      params.push(customPermissions);
    }
    else {
      q = 'INSERT INTO roles (id, name, description, lookup, priority, highlight_color, custom_permissions, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, now(), now()) RETURNING id';
      params.push(customPermissions);
    }
    return db.scalar(q, params)
    .then(helper.slugify);
  }
  else { // for custom roles
    params = [role.name, role.description || '', role.name, role.priority, role.highlight_color || role.highlightColor];
    if (basePermissions) {
      q = 'INSERT INTO roles (name, description, lookup, priority, highlight_color, base_permissions, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, now(), now()) RETURNING id';
      params.push(basePermissions);
    }
    else {
      q = 'INSERT INTO roles (name, description, lookup, priority, highlight_color, custom_permissions, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, now(), now()) RETURNING id';
      params.push(customPermissions);
    }
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
