var Boom = require('boom');
var Promise = require('bluebird');
var path = require('path');
var common = require(path.normalize(__dirname + '/../common'));

module.exports = function postsUpdate(server, auth, postId, threadId) {
  var userId = auth.credentials.id;

  // check base permission
  var allowed = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'posts.update.allow'
  });

  // User has priority and moderator permission
  var standardModCond = [
    {
      // permission based override
      error: Boom.forbidden(),
      type: 'isMod',
      method: server.db.moderators.isModeratorWithPostId,
      args: [userId, postId],
      permission: 'posts.update.bypass.owner.mod'
    },
    {
      type: 'runValidation',
      method: common.hasPriority,
      args: [server, auth, 'posts.update.bypass.owner.mod', postId]
    }
  ];
  var standardMod = server.authorization.stitch(Boom.forbidden(), standardModCond, 'all');

  // is post owner
  var ownerCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.update.bypass.owner.admin'
    },
    {
      // is post owner
      type: 'isOwner',
      method: server.db.posts.find,
      args: [postId],
      userId: userId
    },
    standardMod,
    {
      type: 'runValidation',
      method: common.hasPriority,
      args: [server, auth, 'posts.update.bypass.owner.priority', postId]
    }
  ];
  var owner = server.authorization.stitch(Boom.forbidden('owner'), ownerCond, 'any');

  // can write to post
  var deletedCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.update.bypass.deleted.admin'
    },
    {
      // is post not deleted
      type: 'dbNotProp',
      method: server.db.posts.find,
      args: [postId],
      prop: 'deleted'
    },
    {
      // is board moderator
      type: 'isMod',
      method:  server.db.moderators.isModeratorWithPostId,
      args: [userId, postId],
      permission: server.plugins.acls.getACLValue(auth, 'posts.update.bypass.deleted.mod')
    },
    {
      type: 'runValidation',
      method: common.hasPriority,
      args: [server, auth, 'posts.update.bypass.deleted.priority', postId]
    }
  ];
  var deleted = server.authorization.stitch(Boom.forbidden('deleted'), deletedCond, 'any');

  // is thread locked
  var tLockedCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.update.bypass.locked.admin'
    },
    {
      // is thread locked
      type: 'dbNotProp',
      method: server.db.threads.find,
      args: [threadId],
      prop: 'locked'
    },
    {
      // is board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithThreadId,
      args: [userId, threadId],
      permission: server.plugins.acls.getACLValue(auth, 'posts.update.bypass.locked.mod')
    },
    {
      type: 'runValidation',
      method: common.hasPriority,
      args: [server, auth, 'posts.update.bypass.locked.priority', postId]
    }
  ];
  var tLocked = server.authorization.stitch(Boom.forbidden('locked'), tLockedCond, 'any');

  // is thread locked
  var bLockedCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.update.bypass.locked.admin'
    },
    {
      // is board post editing locked
      type: 'dbNotProp',
      method: function(threadId) {
        return server.db.threads.find(threadId)
        .then(function(thread) {
          return server.db.boards.find(thread.board_id)
        });
      },
      args: [threadId],
      prop: 'disable_post_edit'
    },
    {
      // is board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithThreadId,
      args: [userId, threadId],
      permission: server.plugins.acls.getACLValue(auth, 'posts.update.bypass.locked.mod')
    },
    {
      type: 'runValidation',
      method: common.hasPriority,
      args: [server, auth, 'posts.update.bypass.locked.priority', postId]
    }
  ];
  var bLocked = server.authorization.stitch(Boom.forbidden('Post editing is disabled for this board'), bLockedCond, 'any');

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

  // -- is User Account Active
  var active = server.authorization.build({
    error: Boom.forbidden('Account Not Active'),
    type: 'isActive',
    server: server,
    userId: userId
  });

  // final promise
  return Promise.all([allowed, owner, deleted, read, write, tLocked, bLocked, pLocked, active]);
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
