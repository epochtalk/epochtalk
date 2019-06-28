var path = require('path');
var Boom = require('boom');
var common = require(path.normalize(__dirname + '/common'));

module.exports = function(server, auth, noteId) {
  var hasPermission = server.authorization.build({
      error: Boom.forbidden(),
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'userNotes.update.allow'
    });

  var isOwner = common.isOwner(server, auth, noteId);
  return Promise.all([hasPermission, isOwner]);
};
