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
  }
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
  }
};

module.exports = [ upsert, get ];

