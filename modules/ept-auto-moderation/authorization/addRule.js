var Boom = require('boom');

module.exports = function(server, auth) {
  return server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'autoModeration.addRule.allow'
  });
};
