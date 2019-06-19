var Boom = require('boom');

module.exports = function(server, auth, email) {

  // check unique email
  var emailCond = server.db.users.userByEmail(email)
  .then(function(user) {
    if (user) { return Promise.reject(Boom.badRequest('Email Already Exists')); }
    else { return true; }
  });

  // invitation does not exist
  var hasInvitation = server.db.invitations.hasInvitation(email)
  .then(function(invitationExists) {
    if (!invitationExists) { return Promise.reject(Boom.badRequest('Invitation Does Not Exists')); }
    else { return true; }
  });

  // has permission
  var permission = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'invitations.resend.allow'
  });

  return Promise.all([emailCond, hasInvitation, permission]);
};
