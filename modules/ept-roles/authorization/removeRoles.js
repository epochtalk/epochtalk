var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function(server, auth) {
  return server.authorization.build({
    error: boom.forbidden(),
    type: 'haspermission',
    server: server,
    auth: auth,
    permission: 'adminRoles.remove',
    method: adminRolesRemove
  });
};

function adminRolesRemove(roleId){
  var defaultRoleIds = [
    'irXvScLORCGVJLtF8onULA', // Super Administrator
    'BoYOb5rATCqNnEFzQwYvuA', // Administrator
    '-w9wtzZST32hZgXuaOdCjQ', // Global Moderator
    'wNOXcRVBS3GRIq8HNsrSPQ', // Moderator
    '7c2Pd840RDO6hRf5sXo7YA', // User
    'Z6qgHsx0TD2bP1am9lRwmA', // Banned
    '2j9S2kjDRIeFm7uyloUD4Q', // Anonymous
    '80kyFis5QceKXgR1Qo0q9A', // Private
  ];

  var canDelete = true;
  if (defaultRoleIds.indexOf(roleId) > -1) {
    canDelete = Promise.reject(Boom.badRequest('You may not delete the default roles.'));
  }
  return canDelete;
}
