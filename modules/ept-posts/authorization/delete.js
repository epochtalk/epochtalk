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

  // Is user self moderator and do they have priority to hide post
  var selfModCond = [
    {
      // permission based override
      error: Boom.forbidden(),
      type: 'isMod',
      method: server.db.moderators.isModeratorSelfModerated,
      args: [userId, postId],
      permission: 'posts.delete.bypass.owner.selfMod'
    },
    {
      type: 'runValidation',
      method: common.hasPriority,
      args: [server, auth, 'posts.delete.bypass.owner.selfMod', postId]
    }
  ];
  var selfMod = server.authorization.stitch(Boom.forbidden(), selfModCond, 'all');

  // User has priority permission
  var prioritySelfModCond = [
    {
      // permission based override
      error: Boom.forbidden(),
      type: 'isMod',
      method: server.db.moderators.isModeratorSelfModerated,
      args: [userId, postId],
      permission: 'posts.delete.bypass.owner.priority'
    },
    {
      type: 'runValidation',
      method: common.hasPriority,
      // The boolean at the end tells hasPriority to pass if auth user is Patroller and post creator is a user
      args: [server, auth, 'posts.delete.bypass.owner.priority', postId, true]
    }
  ];
  var prioritySelfMod = server.authorization.stitch(Boom.forbidden(), prioritySelfModCond, 'all');

  // is post alright to delete
  var deleteCond = [
    {
      // permission based override
      type: 'hasPermission',
      error: Boom.forbidden(),
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
    selfMod,
    // Has priority permission
    prioritySelfMod,
    {
      type: 'runValidation',
      method: common.hasPriority,
      args: [server, auth, 'posts.delete.bypass.owner.priority', postId]
    }
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
    }
  ];
  var tLocked = server.authorization.stitch(Boom.forbidden('Thread Locked'), tLockedCond, 'any');

  // post locked
  var pLocked = server.authorization.build({
    error: Boom.forbidden('Post is locked'),
    type: 'dbNotProp',
    method: server.db.posts.find,
    args: [postId],
    prop: 'locked'
  });

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
