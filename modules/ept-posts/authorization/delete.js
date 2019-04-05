var Boom = require('boom');
var Promise = require('bluebird');
var path = require('path');
var common = require(path.normalize(__dirname + '/../common'));

module.exports = function postsDelete(server, auth, postId) {
  var userId = auth.credentials.id;

  // check base permissions
  var allowed = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'posts.delete.allow'
  });

  // is not first post
  var notFirst = server.authorization.build({
    error: Boom.forbidden(),
    type: 'isNotFirstPost',
    method: server.db.posts.getThreadFirstPost,
    args: [postId]
  });

  // is post alright to delete
  var hasSMPrivilege = server.plugins.acls.getACLValue(auth, 'threads.moderated');
  var isThreadModerated = server.db.posts.isPostsThreadModerated(postId);
  var isThreadOwner = server.db.posts.isPostsThreadOwner(postId, userId);
  var isModHasPriority = common.hasPriority(server, auth, 'posts.delete.bypass.locked.mod', postId);
  var deleteCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.delete.bypass.owner.admin'
    },
    {
      // is post owner
      type: 'isOwner',
      method: server.db.posts.find,
      args: [postId],
      userId: userId
    },
    {
      // is board mod
      type: 'isMod',
      method: server.db.moderators.isModeratorWithPostId,
      args: [userId, postId],
      permission: server.plugins.acls.getACLValue(auth, 'posts.delete.bypass.owner.mod')
    },
    Promise.join(isThreadModerated, isThreadOwner, hasSMPrivilege, isModHasPriority, function(threadSM, owner, userSM, priority) {
      if (threadSM && owner && userSM && priority) { return true; }
      else { return Promise.reject(Boom.forbidden()); }
    }),
     common.hasPriority(server, auth, 'posts.delete.bypass.owner.priority', postId)
  ];
  var deleted = server.authorization.stitch(Boom.forbidden(), deleteCond, 'any');

  // is thread locked
  var tLockedCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.delete.bypass.locked.admin'
    },
    {
      // is thread locked
      type: 'dbNotProp',
      method: server.db.posts.getPostsThread,
      args: [postId],
      prop: 'locked'
    },
    {
      // is board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithPostId,
      args: [userId, postId],
      permission: server.plugins.acls.getACLValue(auth, 'posts.delete.bypass.locked.mod')
    },
    common.hasPriority(server, auth, 'posts.delete.bypass.locked.priority', postId)
  ];
  var tLocked = server.authorization.stitch(Boom.forbidden(), tLockedCond, 'any');

  // post locked
  var pLocked = postLocked(server, auth, postId);

  // read board
  var read = server.authorization.build({
    error: Boom.notFound('Board Not Found'),
    type: 'dbValue',
    method: server.db.posts.getPostsBoardInBoardMapping,
    args: [postId, server.plugins.acls.getUserPriority(auth)]
  });

  // write board
  var write = server.authorization.build({
    error: Boom.forbidden('No Write Access'),
    type: 'dbValue',
    method: server.db.posts.getBoardWriteAccess,
    args: [postId, server.plugins.acls.getUserPriority(auth)]
  });

  // is requester active
  var active = server.authorization.build({
    error: Boom.forbidden('Account Not Active'),
    type: 'isActive',
    server: server,
    userId: userId
  });

  return Promise.all([allowed, notFirst, deleted, read, write, tLocked, pLocked, active]);
};


function postLocked(server, auth, postId) {
  var userId = auth.credentials.id;
  return server.db.posts.find(postId)
  .then(function(post) {
    if (post.locked && post.user.id === userId) {
      return Promise.reject(Boom.forbidden('Post is Locked'));
    }
    else { return true; }
  })
  .error(function(err) { return Promise.reject(Boom.notFound(err)); });
}
