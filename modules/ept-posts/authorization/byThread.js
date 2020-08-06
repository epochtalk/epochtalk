var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function postsByThread(server, auth, threadId, slug) {
  // try mode on
  var userId = '';
  var authenticated = auth.isAuthenticated;
  if (authenticated) { userId = auth.credentials.id; }

  // check base permission
  var allowed = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'posts.byThread.allow'
  });

  // read board
  var read = server.authorization.build({
    error: Boom.notFound('Board Not Found'),
    type: 'dbValue',
    method: server.db.threads.getThreadsBoardInBoardMapping,
    args: [threadId, server.plugins.acls.getUserPriority(auth), slug]
  });

  // view deleted posts
  var viewAll = server.plugins.acls.getACLValue(auth, 'posts.byThread.bypass.viewDeletedPosts.admin');
  var viewSome = server.plugins.acls.getACLValue(auth, 'posts.byThread.bypass.viewDeletedPosts.mod');
  var viewSelfMod = server.plugins.acls.getACLValue(auth, 'posts.byThread.bypass.viewDeletedPosts.selfMod');
  var viewPriority = server.plugins.acls.getACLValue(auth, 'posts.byThread.bypass.viewDeletedPosts.priority');
  var viewDeleted = server.db.moderators.getUsersBoards(userId)
  .then(function(boards) {
    var result = false;
    if (viewAll || viewPriority) { result = true; }
    else if (viewSome && boards.length > 0) { result = boards; }
    else if (viewSelfMod && !boards.length) {
      result = server.db.moderators.isModeratorSelfModeratedThread(auth.credentials.id, threadId);
    }
    return result;
  });



  return Promise.all([allowed, read, viewDeleted])
  .then((data) => { return data[2]; });
};
