var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function userActivate(server, auth, userId) {
  // check base permission
  var allowed = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'users.reactivate.allow'
  });

  // check if user is activating their own page
  var paramUserId = userId;
  var authedUserId = auth.credentials.id;
  var sameUser = () => {
    return new Promise(function(resolve, reject) {
      if (paramUserId === authedUserId) { return resolve(); }
      else { return reject(Boom.badRequest()); }
    });
  };

  return Promise.all([allowed, sameUser()]);
};
