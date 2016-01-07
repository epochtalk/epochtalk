var _ = require('lodash');
var Boom = require('boom');
var path = require('path');
var roles = require(path.normalize(__dirname + '/roles'));
var db = require(path.normalize(__dirname + '/../../../db'));
var config = require(path.normalize(__dirname + '/../../../config'));

exports.register = function (server, options, next) {
  // Check ACL roles on each route
  server.ext('onPostAuth', function (request, reply) {
    var routeACL = request.route.settings.plugins.acls;
    // route has no ACLs so allow access
    if (!routeACL) { return reply.continue(); }
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
    if (validACL) { return reply.continue(); }
    else { return reply(err); }
  });

  server.expose('getACLValue', getACLValue);
  server.expose('getUserPriority', getUserPriority);
  server.expose('verifyRoles', verifyRoles);

  return verifyRoles().then(next);
};

function getUserPriority(auth) {
  var roleNames = [];

  // find matching user roles
  if (auth.isAuthenticated && _.isArray(auth.credentials.roles)) {
    roleNames = auth.credentials.roles.map(function(roleName) { return roles[roleName].priority; });
  }
  else if (auth.isAuthenticated) { roleNames = [ roles.user.priority ]; }
  else if (config.loginRequired) { roleNames = [ roles.private.priority ]; }
  else { roleNames = [ roles.anonymous.priority ]; }

  var userPriority = _.min(roleNames);

  return userPriority;
}

function verifyRoles() {
  // get all the roles from the DB
  return db.roles.all()
  // find any that are missing and add them
  .then(function(dbRoles) {
    _.mapValues(roles, function(role) {
      // check if this role is in dbRoles
      var dbRoleFound = _.find(dbRoles, function(dbRole) {
        return role.id === dbRole.id || role.lookup === dbRole.lookup;
      });

      // if role found in db and permissions exists, use these
      if (dbRoleFound && dbRoleFound.permissions) {
        // check if permissions are set
        var newRole = dbRoleFound.permissions;
        newRole.id = dbRoleFound.id;
        newRole.name = dbRoleFound.name;
        newRole.description = dbRoleFound.description;
        newRole.lookup = dbRoleFound.lookup;
        newRole.priority = dbRoleFound.priority;
        newRole.highlight_color = dbRoleFound.highlight_color;
        roles[newRole.lookup] = newRole;
      }
      // if role found and no permissions, update permissions
      else if (dbRoleFound) {
        var clonedRole = _.clone(role);
        delete clonedRole.id;
        delete clonedRole.name;
        delete clonedRole.lookup;
        delete clonedRole.description;
        delete clonedRole.priority;
        delete clonedRole.highlightColor;
        var updateRole = {
          id: dbRoleFound.id,
          permissions: clonedRole
        };
        return db.roles.update(updateRole);
      }
      // dbRole not found, so add the role to db
      else {
        var clonedAddRole = _.clone(role);
        delete clonedAddRole.id;
        delete clonedAddRole.name;
        delete clonedAddRole.lookup;
        delete clonedAddRole.description;
        delete clonedAddRole.priority;
        delete clonedAddRole.highlightColor;
        var addRole = {
          id: role.id,
          name: role.name,
          lookup: role.lookup,
          description: role.description,
          priority: role.priority,
          highlightColor: role.highlightColor,
          permissions: clonedAddRole
        };
        return db.roles.add(addRole);
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
      roles[dbRole.lookup] = newRole;
    }
    return;
  }).then(function() { return; }); // need to return undefined
}

function getACLValue(auth, acl) {
  // input validation
  if (!acl) { return false; }

  var userACLs = [];
  var validACL = false; // default everything to false

  // find matching user roles
  if (auth.isAuthenticated && _.isArray(auth.credentials.roles)) {
    userACLs = auth.credentials.roles.map(function(roleName) { return roles[roleName]; });
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

exports.register.attributes = {
  name: 'acls',
  version: '1.0.0'
};
