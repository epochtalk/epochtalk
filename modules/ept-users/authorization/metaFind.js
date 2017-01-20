var Boom = require('boom');
var Promise = require('bluebird');
var querystring = require('querystring');

module.exports = function userFind(server, auth, params) {
  // check base Permission
  var allowed = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'users.find.allow'
  });

  var conditions = [
    {
      // is the user account we're looking for active
      // already checks if current user is viewing their own page
      type: 'isAccountActive',
      server: server,
      username: querystring.unescape(params.username),
      userId: ''
    }
  ];
  var active = server.authorization.stitch(Boom.notFound(), conditions, 'any');

  return Promise.all([allowed, active])
  .then(() => { return true; })
  .catch(() => { return false; });
};
