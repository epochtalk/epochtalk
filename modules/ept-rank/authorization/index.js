var Boom = require('boom');

var upsert = {
  name: 'auth.rank.upsert',
  method: function(server, auth) {
    return server.authorization.build({
      error: Boom.forbidden(),
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'rank.upsert.allow'
    });
  },
  options: { callback: false }
};

var get = {
  name: 'auth.rank.get',
  method: function(server, auth) {
    return server.authorization.build({
      error: Boom.forbidden(),
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'rank.get.allow'
    });
  },
  options: { callback: false }
};

module.exports = [ upsert, get ];

