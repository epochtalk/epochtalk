var path = require('path');
var Boom = require('boom');
var config = require(path.normalize(__dirname + '/../../../config'));
var commonPre = require(path.normalize(__dirname + '/../common')).auth;
var sanitizer = require(path.normalize(__dirname + '/../../sanitizer'));

module.exports = {
  canCreate: isAdmin,
  canDelete: isAdmin,
  clean: function(request, reply) {
    request.payload.name = sanitizer.strip(request.payload.name);
    return reply();
  }
};

function isAdmin(request, reply) {
  var username = '';
  var authenticated = request.auth.isAuthenticated;
  if (authenticated) { username = request.auth.credentials.username; }
  var promise = commonPre.isAdmin(authenticated, username)
  .then(function(admin) {
    var result = Boom.forbidden();
    if (admin) { result = ''; }
    return result;
  }).catch(console.log);
  return reply(promise);
}
