var Boom = require('boom');
var Promise = require('bluebird');
var querystring = require('querystring');

module.exports = function userFind(server, auth, params) {
  // try mode on: must check user is authed
  var userId;
  if (auth.isAuthenticated) { userId = auth.credentials.id; }

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
      userId: userId
    },
    {
      // Permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'users.find.bypass.viewDeleted'
    }
  ];
  var active = server.authorization.stitch(Boom.notFound(), conditions, 'any');

  var adminView = server.plugins.acls.getACLValue(auth, 'users.find.bypass.viewMoreInfo');
  var viewer = server.db.users.userByUsername(querystring.unescape(params.username))
  .then(function(user) {
    if (user && user.id === userId) { return true; }
    else if (user && adminView) { return true; }
    else { return false; }
  });

  return Promise.all([allowed, active, viewer])
  .then((dataArr) => { return dataArr[2]; });
};
