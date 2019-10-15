var Boom = require('boom');

module.exports = function(server, auth) {
  // check base permission
  var allowed = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'boards.moveList.allow'
  });

  var admin = server.plugins.acls.getACLValue(auth, 'threads.move.bypass.owner.admin');

  return Promise.all([allowed, admin])
  .then(function(dataArr) { return dataArr[1]; });
};
