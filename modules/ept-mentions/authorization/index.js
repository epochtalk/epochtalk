var Boom = require('boom');

var pageAuthorization = function(server, auth) {
  return server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'mentions.page.allow'
  });
};

var createAuthorization = function(server, auth) {
  return server.authorization.build({
    type: 'getPermissionValue',
    server: server,
    auth: auth,
    permission: 'mentions.create.allow'
  });
};

var deleteAuthorization = function(server, auth) {
  return server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'mentions.delete.allow'
  });
};

module.exports = [
  {
    name: 'auth.mentions.page',
    method: pageAuthorization
  },
  {
    name: 'auth.mentions.create',
    method: createAuthorization
  },
  {
    name: 'auth.mentions.delete',
    method: deleteAuthorization
  }
];
