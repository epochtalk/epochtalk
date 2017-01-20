var Boom = require('boom');

module.exports = function(server, auth, email) {
  // invitation exists
  var hasInvitation = server.db.users.hasInvitation(email)
  .then(function(invitationExists) {
    if (invitationExists) { return true; }
    else { return Promise.reject(Boom.badRequest('User does not have an invitation')); }
  });

  // has permission
  var permission = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'users.removeInvite.allow'
  });

  return Promise.all([permission, hasInvitation]);
};
