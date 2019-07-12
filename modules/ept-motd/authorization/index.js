var Boom = require('boom');

var save = function(server, auth) {
  return server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'motd.save.allow'
  });
};

var get = function(server, auth) {
  return server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'motd.get.allow'
  });
};

module.exports = [
  {
    name: 'auth.motd.save',
    method: save
  },
  {
    name: 'auth.motd.get',
    method: get
  },
];
