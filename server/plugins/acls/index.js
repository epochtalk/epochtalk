var _ = require('lodash');
var Boom = require('boom');
var path = require('path');
var roles = require(path.normalize(__dirname + '/roles'));
var config = require(path.normalize(__dirname + '/../../../config'));

exports.register = function (server, options, next) {
  // Check ACL roles on each route
  server.ext('onPostAuth', function (request, reply) {
    return reply.continue();
    var routeACL = request.route.settings.plugins.acls;
    // route has no ACLs so allow access
    if (!routeACL) { return reply.continue(); }
    var userACLs = [];
    var authenticated = request.auth.isAuthenticated;
    var err = Boom.unauthorized('You must log in to see this content.');
    if (authenticated) {
      //userACLs = request.auth.roles.map(function(roleName) { return roles[roleName]; });
      if (!userACLs.length) { userACLs = [ roles.user ]; }
      err = Boom.forbidden('You do not have the proper permissions.');
    }
    else if (config.loginRequired) { userACLs = [ roles.noRead ]; }
    else { userACLs = [ roles.anonymous ]; }

    userACLs = [ roles.superAdmin, roles.moderator, roles.user, roles.private ];

    var ACLValues = userACLs.map(function(acl) { return _.get(acl, routeACL); });
    var validACL = false;
    ACLValues.forEach(function(val) { validACL = val || validACL; });
    if (validACL) { return reply.continue(); }
    else { return reply(err); }
  });

  server.expose('getACLValue', getACLValue);

  next();
};

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
