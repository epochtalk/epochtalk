var Boom = require('boom');

module.exports = function(server, auth) {
  // check base permission
  return server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'categories.find.allow'
  });
};
