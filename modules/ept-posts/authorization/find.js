var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function postsFind(server, auth, postId) {
  // try mode on: must check user is authed
  var userId = '';
  var authenticated = auth.isAuthenticated;
  if (authenticated) { userId = auth.credentials.id; }

  // check base permission
  var allowed = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'posts.find.allow'
  });

  // read board
  var read = server.authorization.build({
    error: Boom.notFound('Board Not Found'),
    type: 'dbValue',
    method: server.db.posts.getPostsBoardInBoardMapping,
    args: [postId, server.plugins.acls.getUserPriority(auth)]
  });

  // view deleted
  var deletedCond = [
    server.authorization.build({
      // permission based override
      error: Boom.notFound(),
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.find.bypass.viewDeletedPosts.admin'
    }),
    server.authorization.build({
      // is board moderator
      error: Boom.notFound(),
      type: 'isMod',
      method: server.db.moderators.isModeratorWithPostId,
      args:[userId, postId],
      permission: server.plugins.acls.getACLValue(auth, 'posts.find.bypass.viewDeletedPosts.mod')
    })
  ];

  var deleted = Promise.any(deletedCond)
  .then(() => { return true; })
  .catch(() => { return false; });

  // final promise
  return Promise.all([allowed, read, deleted])
  .then((dataArr) => { return dataArr[2]; });
};
