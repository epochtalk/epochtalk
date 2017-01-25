var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function(server, auth) {
  // check base permission
  var allowed = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'boards.allCategories.allow'
  });

  var priority = server.plugins.acls.getUserPriority(auth);

  return Promise.all([allowed, priority])
  .then(function(dataArr) { return dataArr[1]; });
};
