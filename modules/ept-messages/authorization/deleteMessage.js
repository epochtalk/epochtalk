var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function messagesDelete(server, auth, messageId) {
  var userId = auth.credentials.id;

  var allowed = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'messages.delete.allow'
  });

  var conditions = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'messages.delete.bypass.owner'
    },
    // is message owner
    {
      type: 'dbValue',
      method: server.db.messages.isMessageSender,
      args: [messageId, userId]
    }
  ];

  var owner = server.authorization.stitch(Boom.forbidden(), conditions, 'any');

  return Promise.all([allowed, owner]);
};
