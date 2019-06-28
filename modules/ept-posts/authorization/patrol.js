var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function isPatroller(auth) {
  var hasRole = false;
  auth.credentials.roles.map(function(role) {
    if (role === 'patroller') { hasRole = true; }
  });

  if (hasRole) { return true }
  else { return Promise.reject(Boom.forbidden('You do not have the appropriate role to view this content')); }
}
