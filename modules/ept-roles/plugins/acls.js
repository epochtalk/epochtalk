var _ = require('lodash');
var Boom = require('boom');
var path = require('path');
var diff = require('deep-diff');
var roles = require(path.normalize(__dirname + '/roles'));

var db, config, defaultPerms, validations, layouts;

module.exports = {
  name: 'acls',
  version: '1.0.0',
  verifyRoles: verifyRoles,
  register: async function (server, options) {
    if (!options.db) { return new Error('No DB found in ACLS'); }
    if (!options.config) { return new Error('No Configs found in ACLS'); }
    db = options.db;
    config = options.config;
    defaultPerms = options.permissions.defaults;
    validations = options.permissions.validations;
    layouts = options.permissions.layouts;

    buildRoles(defaultPerms);

    // Check ACL roles on each route
    server.ext('onPostAuth', function (request, h) {
      var routeACL = request.route.settings.plugins.acls;
      // route has no ACLs so allow access
      if (!routeACL) { return h.continue; }
      var userACLs = [];
      var authenticated = request.auth.isAuthenticated;
      var err = Boom.unauthorized('You must log in to see this content.');
      if (authenticated) {
        var userBanned = request.auth.credentials.roles.indexOf(roles.banned.lookup) > -1;
        if (userBanned) { userACLs = [ roles.banned ]; }
        else {
          userACLs = _.filter(request.auth.credentials.roles.map(function(roleName) { return roles[roleName]; }), undefined);
        }
        if (!userACLs.length) { userACLs = [ roles.user ]; }
        err = Boom.forbidden('You do not have the proper permissions.');
      }
      else if (config.loginRequired) { userACLs = [ roles.private ]; }
      else { userACLs = [ roles.anonymous ]; }

      var ACLValues = userACLs.map(function(acl) { return _.get(acl, routeACL); });
      var validACL = false;
      ACLValues.forEach(function(val) { validACL = val || validACL; });
      if (validACL) { return h.continue; }
      else { return err; }
    });

    // server exposed objects
    server.expose('getACLValue', getACLValue);
    server.expose('getUserPriority', getUserPriority);
    server.expose('getPriorityRestrictions', getPriorityRestrictions);
    server.expose('verifyRoles', verifyRoles);

    // server decoration
    server.decorate('server', 'roles', roles);
    server.decorate('request', 'roles', roles);
    server.decorate('server', 'roleLayouts', layouts);
    server.decorate('request', 'roleLayouts', layouts);
    server.decorate('server', 'roleValidations', validations);
    server.decorate('request', 'roleValidations', validations);

    var rolesAPI = {
      addRole: addRole,
      updateRole: updateRole,
      deleteRole: deleteRole,
      getRole: function(name) { return roles[name]; },
      reprioritizeRoles: reprioritizeRoles
    };
    server.decorate('server', 'rolesAPI', rolesAPI);
    server.decorate('request', 'rolesAPI', rolesAPI);
    return verifyRoles()
    .then(function() {
      server.app.rolesData = roles;
      return;
    });
  }
};

function buildRoles(permissions) {
  var moduleKeys = Object.keys(permissions);
  moduleKeys.forEach(function(moduleName) {
    roles = _.mapValues(roles, function(role) {
      var lookup = role.lookup;
      role[moduleName] = permissions[moduleName][lookup];
      return role;
    });
  });
}

function getUserPriority(auth) {
  var rolePriorities = [];
  var bannedPriority;

  // find matching user roles
  if (auth.isAuthenticated && _.isArray(auth.credentials.roles)) {
    rolePriorities = auth.credentials.roles.map(function(roleName) {
      if (roleName === 'banned') { bannedPriority = roles[roleName].priority; }
      return roles[roleName].priority;
    });
  }
  else if (auth.isAuthenticated) { rolePriorities = [ roles.user.priority ]; }
  else if (config.loginRequired) { rolePriorities = [ roles.private.priority ]; }
  else { rolePriorities = [ roles.anonymous.priority ]; }

  if (bannedPriority) { return bannedPriority; }
  else { return _.min(rolePriorities); }
}

function getPriorityRestrictions(auth) {
  var priorityRestrictions;
  var curPriority;
  // Take priority restrictions from the highest priority role 0 being the highest
  if (auth.isAuthenticated && _.isArray(auth.credentials.roles)) {
    var roleNames = auth.credentials.roles;
    for (var i = 0; i < roleNames.length; i++) {
      var roleName = roleNames[i];
      var curRole = roles[roleName];
      if (curPriority > curRole.priority || !curPriority) {
        priorityRestrictions = curRole.priorityRestrictions;
        // Banned role takes precedence
        if (curRole.lookup === 'banned') { break; }
      }
      curPriority = curRole.priority;
    }
  }
  else if (auth.isAuthenticated) { priorityRestrictions = roles.user.priorityRestrictions; }
  else if (config.loginRequired) { priorityRestrictions = roles.private.priorityRestrictions; }
  else { priorityRestrictions = roles.anonymous.priorityRestrictions; }
  return priorityRestrictions;
}

function verifyRoles(reload, roleLookup) {
  if (!db || reload) {
    db = require(path.normalize(__dirname + '/../../../db'));
    var modules = require(path.normalize(__dirname + '/../../../server/plugins/modules'));
    var master = modules.install(db, config);
    buildRoles(master.permissions.defaults);
  }

  // get all the roles from the DB
  return db.roles.all()
  // find any that are missing and add them
  .then(function(dbRoles) {
    _.mapValues(roles, function(role) {
      // check if this role is in dbRoles
      var dbRole = _.find(dbRoles, function(dbRole) {
        return role.id === dbRole.id || role.lookup === dbRole.lookup;
      });

      var modulePermissions = _.clone(role);
      delete modulePermissions.id;
      delete modulePermissions.name;
      delete modulePermissions.lookup;
      delete modulePermissions.description;
      delete modulePermissions.priority;
      delete modulePermissions.highlightColor;

      var updatedRole = {
        id: dbRole ? dbRole.id : role.id,
        name: role.name,
        lookup: role.lookup,
        description: role.description,
        priority: role.priority,
        highlightColor: role.highlightColor,
        permissions: modulePermissions,
        custom_permissions: modulePermissions
      };
      /*
        1. Diff module and base permissions
          a. Changes detected
            i.  Apply diff to custom permissions and store
            ii. Store module permissions as new base permissions
          b. No Changes detected
            i.  Continue
        2. Use custom permissions to populate in memory role object
        3. If no permissions are present, but the dbRole is found use module permissions
        4. If no db role is found, create the role using module permissions
      */
      var storeCustomPermissions;
      var permissionDiff = (dbRole && dbRole.base_permissions) ? diff(dbRole.base_permissions, modulePermissions) : undefined;

      // There is a change to the module permissions. Update base permissions and custom permissions
      if (permissionDiff) {
        // console.log('===DB ROLE ' + dbRole.name + '====')
        // console.log(JSON.stringify(dbRole.permissions.posts, null, 2));
        // console.log('---MODULE ROLE ' + dbRole.name + '----')
        // console.log(JSON.stringify(modulePermissions.posts, null, 2));
        console.log('+++DIFF ROLES ' + dbRole.name + '++++')
        console.log(JSON.stringify(diff(dbRole.base_permissions, modulePermissions), null, 2));
        console.log('\n\n');
        permissionDiff.forEach(function(diff) {
          if (diff.kind === 'N') { // Property added
            // Add new property to custom permission set
          }
          else if (diff.kind === 'D') { // Property deleted
            // Remove property from custom permission set
          }
          else if (diff.kind === 'E') { // Property changed
            // If property in custom permissions matches default, update property to match module
          }
        });
      }

      // if role found in db and permissions exists, use these
      if (dbRole && dbRole.permissions && Object.keys(dbRole.permissions).length > 0) {
        // check if permissions are set
        var newRole = dbRole.permissions;
        newRole.id = dbRole.id;
        newRole.name = dbRole.name;
        newRole.description = dbRole.description;
        newRole.lookup = dbRole.lookup;
        newRole.priority = dbRole.priority;
        newRole.highlight_color = dbRole.highlight_color;
        roles[newRole.lookup] = newRole;
      }
      // if role found and no permissions, update permissions
      else if (dbRole) {
        // TODO: Implement diff and update custom permissions before updating.
        return db.roles.update(updatedRole);
      }
      // dbRole not found, so add the role to db
      else {
        return db.roles.create(updatedRole);
      }
    });

    return dbRoles;
  })
  // pull any roles that aren't default into the roles Object
  .map(function(dbRole) {
    var memRoleFound = _.find(roles, function(role) {
      return role.id === dbRole.id || role.lookup === dbRole.lookup;
    });

    if (!memRoleFound) {
      var newRole = dbRole.permissions;
      newRole.id = dbRole.id;
      newRole.name = dbRole.name;
      newRole.description = dbRole.description;
      newRole.lookup = dbRole.lookup;
      newRole.priority = dbRole.priority;
      newRole.highlight_color = dbRole.highlight_color;
      roles[dbRole.lookup] = newRole;
    }
    return;
  }).then(function() {
    if (roleLookup) {
      return roles[roleLookup];
    }
    else {
      return;
    }
  });
}

function getACLValue(auth, acl) {
  // input validation
  if (!acl) { return false; }

  var userACLs = [];
  var validACL = false; // default everything to false

  // find matching user roles
  if (auth.isAuthenticated && _.isArray(auth.credentials.roles)) {
    var userBanned = auth.credentials.roles.indexOf(roles.banned.lookup) > -1;
    if (userBanned) {
      userACLs = [ roles.banned ];
    }
    else {
      userACLs = auth.credentials.roles.map(function(roleName) { return roles[roleName]; });
    }
  }
  else if (auth.isAuthenticated) { userACLs = [ roles.user ]; }
  else if (config.loginRequired) { userACLs = [ roles.private ]; }
  else { userACLs = [ roles.anonymous ]; }


  // grab single permission from each role
  var ACLValues = userACLs.map(function(userACL) { return _.get(userACL, acl); });
  // OR all the permission values together
  ACLValues.forEach(function(val) { validACL = val || validACL; });

  return validACL;
}

function addRole(role) {
  // Add role to the in memory role object
  roles[role.lookup] = role.permissions;
  roles[role.lookup].id = role.id;
  roles[role.lookup].name = role.name;
  roles[role.lookup].lookup = role.lookup;
  roles[role.lookup].description = role.description;
  roles[role.lookup].priority = role.priority;
  roles[role.lookup].highlightColor = role.highlight_color;
}

function updateRole(role) {
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
}

function deleteRole(roleId) {
  var lookupToDelete;
  Object.keys(roles).forEach(function(roleLookup) {
    if (roles[roleLookup].id === roleId) { lookupToDelete = roleLookup; }
  });
  delete roles[lookupToDelete];
}

function reprioritizeRoles(allRoles) {
  allRoles.forEach(function(role) { roles[role.lookup].priority = role.priority; });
}
