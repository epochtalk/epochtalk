var boom = require('boom');

module.exports = function(server, auth) {
  return server.authorization.build({
    error: boom.forbidden(),
    type: 'haspermission',
    server: server,
    auth: auth,
    permission: 'adminRoles.remove'
  });
};
