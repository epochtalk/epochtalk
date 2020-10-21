var Boom = require('boom');

module.exports = function(server, auth) {
  var allowed = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'posts.search.allow'
  });

  // view deleted posts
  var viewAll = server.plugins.acls.getACLValue(auth, 'posts.byThread.bypass.viewDeletedPosts.admin');
  var viewSome = server.plugins.acls.getACLValue(auth, 'posts.byThread.bypass.viewDeletedPosts.mod');
  var viewPriority = server.plugins.acls.getACLValue(auth, 'posts.byThread.bypass.viewDeletedPosts.priority');
  var viewDeleted = server.db.moderators.getUsersBoards(auth.credentials.id)
  .then(function(boards) {
    var result = false;
    if (viewAll || viewPriority) { result = true; }
    else if (viewSome && boards.length > 0) { result = boards; }
    return result;
  });

  return Promise.all([allowed, viewDeleted])
  .then((data) => { return data[1]; });
};
