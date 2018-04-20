var Boom = require('boom');

var add = {
  name: 'auth.rank.add',
  method: function(server, auth) {
    return server.authorization.build({
      error: Boom.forbidden(),
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'rank.add.allow'
    });
  },
  options: { callback: false }
};

var update = {
  name: 'auth.rank.update',
  method: function(server, auth) {
    return server.authorization.build({
      error: Boom.forbidden(),
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'rank.update.allow'
    });
  },
  options: { callback: false }
};

var remove = {
  name: 'auth.rank.remove',
  method: function(server, auth) {
    return server.authorization.build({
      error: Boom.forbidden(),
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'rank.remove.allow'
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

module.exports = [ add, update, remove, get ];

