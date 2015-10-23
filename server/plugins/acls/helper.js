var path = require('path');
var roles = require(path.normalize(__dirname + '/roles'));

module.exports = {
  addRole: function(role) {
    // Add role to the in memory role object
    roles[role.lookup] = role.permissions;
    roles[role.lookup].id = role.id;
    roles[role.lookup].name = role.name;
    roles[role.lookup].lookup = role.lookup;
    roles[role.lookup].description = role.description;
    roles[role.lookup].priority = role.priority;
    roles[role.lookup].highlightColor = role.highlight_color;
  },
  updateRole: function(role) {
    // Update role in the in memory role object
    var parsedPermissions;
    try { parsedPermissions = JSON.parse(role.permissions); } // parse new permissions
    catch(e) { parsedPermissions = roles[role.lookup]; } // this shouldn't happen, keep old permissions on error
    roles[role.lookup] = parsedPermissions;
    roles[role.lookup].id = role.id;
    roles[role.lookup].name = role.name;
    roles[role.lookup].lookup = role.lookup;
    roles[role.lookup].description = role.description;
    roles[role.lookup].priority = role.priority;
    roles[role.lookup].highlightColor = role.highlight_color;
  },
  deleteRole: function(roleId) {
    var lookupToDelete;
    Object.keys(roles).forEach(function(roleLookup) {
      if (roles[roleLookup].id === roleId) { lookupToDelete = roleLookup; }
    });
    delete roles[lookupToDelete];
  },
  reprioritizeRoles: function(allRoles) {
    allRoles.forEach(function(role) { roles[role.lookup].priority = role.priority; });
  },
};
