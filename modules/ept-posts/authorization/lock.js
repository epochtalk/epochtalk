var Boom = require('boom');
var Promise = require('bluebird');
var path = require('path');
var common = require(path.normalize(__dirname + '/../common'));

module.exports = function postsLock(server, auth, postId, query) {
  if (query && !query.locked) { return; }

  var userId = auth.credentials.id;
  // check base permission
  var allowed = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'posts.lock.allow'
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

  var ignoreOwnership = server.authorization.build({
    // permission based override
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'posts.lock.bypass.lock.admin'
  });

  var selfMod = server.authorization.build({
    // is thread moderator
    type: 'isMod',
    method: server.db.moderators.isModeratorSelfModerated,
    args: [auth.credentials.id, postId],
    permission: server.plugins.acls.getACLValue(auth, 'posts.lock.bypass.lock.mod')
  });

  var hasSelfModPrivilege = server.plugins.acls.getACLValue(auth, 'threads.moderated');

  // check self mod permissions
  var permissionsCond = [
    ignoreOwnership,
    common.hasPriority(server, auth, 'posts.lock.bypass.lock.mod', postId), // User has permission to lock posts they mod if user has lesser priority
    common.hasPriority(server, auth, 'posts.lock.bypass.lock.priority', postId) // User has permission to local all posts with lesser priority
  ];

  var permissions = server.authorization.stitch(Boom.forbidden('Invalid permissions'), permissionsCond, 'any');

  var modCond = [
    ignoreOwnership,
    {
      // is board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithPostId,
      args: [userId, postId],
      permission: server.plugins.acls.getACLValue(auth, 'posts.lock.bypass.lock.mod')
    },
    {
      // is thread moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorSelfModerated,
      args: [auth.credentials.id, postId],
      permission: server.plugins.acls.getACLValue(auth, 'posts.lock.bypass.lock.mod')
    },
    // Check if user is self mod and that self mod is enabled
    Promise.join(selfMod, hasSelfModPrivilege, function(sm, smp) {
      return sm && smp;
    })
  ];
  var mod = server.authorization.stitch(Boom.forbidden(), modCond, 'any');

  return Promise.all([allowed, read, write, active, permissions, mod]);
};
