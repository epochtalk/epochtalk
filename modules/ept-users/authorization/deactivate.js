var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function userDeactivate(server, auth, userId) {
  // check base permission
  var allowed = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'users.deactivate.allow'
  });

  // check if user is deactivating their own page
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
