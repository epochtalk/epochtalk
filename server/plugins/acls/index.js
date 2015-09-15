var _ = require('lodash');
var Boom = require('boom');
var path = require('path');
var roles = require(path.normalize(__dirname + '/roles'));
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
      //userACLs = request.auth.roles.map(function(roleName) { return roles[roleName]; });
      if (!userACLs.length) { userACLs = [ roles.user ]; }
      err = Boom.forbidden('You do not have the proper permissions.');
    }
    else if (config.loginRequired) { userACLs = [ roles.noRead ]; }
    else { userACLs = [ roles.anonymous ]; }

    // userACLs = [ roles.superAdmin, roles.moderator, roles.user, roles.noRead ];

    var ACLValues = userACLs.map(function(acl) { return _.get(acl, routeACL); });
    var validACL = false;
    ACLValues.forEach(function(val) { validACL = validACL || val; });
    if (validACL) { return reply.continue(); }
    else { return reply(err); }
  });

  next();
};

exports.register.attributes = {
  name: 'acls',
  version: '1.0.0'
};
