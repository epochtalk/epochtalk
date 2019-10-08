var path = require('path');
var Boom = require('boom');
var Promise = require('bluebird');
var common = require(path.normalize(__dirname + '/common'));

module.exports = function(server, auth, validations, payload) {
  var hasPermission = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'roles.add.allow'
  });

  var payloadValid = common.validateRoles(validations, payload);
  return Promise.all([hasPermission, payloadValid])
};
