var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function(server, auth, userId) {
  var allowed = server.authorization.build({
    error: Boom.forbidden('You do not have the permissions to leave trust feedback'),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'userTrust.addTrustFeedback.allow'
  });

  var authedId = auth.credentials.id;

  var otherUser = function() {
    if (authedId === userId) {
      var err = Boom.forbidden('You cannot leave trust feedback on your own account');
      return Promise.reject(err);
    }
    else { return true; }
  };

  return Promise.all([allowed, otherUser()]);
};
