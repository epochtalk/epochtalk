var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var Promise = require('bluebird');
var using = Promise.using;

/* returns removed role id */
roles.delete = function(roleId) {
  roleId = helper.deslugify(roleId);
  var result = { id: roleId };
  return using(db.createTransaction(), function(client) {
    var q = 'DELETE FROM roles WHERE id = $1 RETURNING name;';
    return client.query(q, [roleId]) //remove role
    .then(function(results) {
      result.name = results.rows[0].name;
      q = 'DELETE FROM roles_users WHERE role_id = $1;';
      return client.query(q, [roleId]); // remove users from role
    })
    .then(function() {
      q = 'SELECT id, priority FROM roles ORDER BY priority';
      return client.query(q); // get all roles with priority
    })
    .then(function(results) { return results.rows; })
    .then(function(roles) {
      var curPriority = 0; // fix priorities after removing a role
      roles.forEach(function(role) { role.priority = curPriority++; });
      q = 'UPDATE roles SET priority = $1 WHERE id = $2';
      return Promise.map(roles, function(role) { // reprioritize all roles
        return client.query(q, [role.priority, role.id]);
      });
    });
  })
  .then(function() { return result; }) // return id of removed role
  .then(helper.slugify);
};
