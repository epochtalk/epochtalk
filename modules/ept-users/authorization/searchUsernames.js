var Boom = require('boom');

module.exports = function(server, auth) {
  // has permission
  return server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'users.searchUsernames.allow'
  });
};
