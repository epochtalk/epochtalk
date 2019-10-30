var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function (server, auth, threadId) {
  var userId = auth.credentials.id;

  // check base permission
  var allowed = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'threads.lock.allow'
  });

  // read board
  var read = server.authorization.build({
    error: Boom.notFound('Board Not Found'),
    type: 'dbValue',
    method: server.db.threads.getThreadsBoardInBoardMapping,
    args: [threadId, server.plugins.acls.getUserPriority(auth)]
  });

  // write board
  var write = server.authorization.build({
    error: Boom.forbidden('No Write Access'),
    type: 'dbValue',
    method: server.db.threads.getBoardWriteAccess,
    args: [threadId, server.plugins.acls.getUserPriority(auth)]
  });

  // is requester active
  var active = server.authorization.build({
    error: Boom.forbidden('Account Not Active'),
    type: 'isActive',
    server: server,
    userId: userId
  });

  // user is not banned from this board
  var notBannedFromBoard = server.authorization.common.isNotBannedFromBoard(Boom.forbidden('You are banned from this board'), server, userId, { threadId: threadId });

  // is thread owner
  var ownerCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'threads.lock.bypass.owner.admin'
    },
    {
      // is owner
      type: 'isThreadOwner',
      method: server.db.threads.getThreadOwner,
      args: [threadId],
      userId: userId,
    },
    {
      // is board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithThreadId,
      args: [userId, threadId],
      permission: server.plugins.acls.getACLValue(auth, 'threads.lock.bypass.owner.mod')
    },
    {
      type: 'runValidation',
      method: function(server, auth, acl, threadId) {
        return server.db.threads.getThreadFirstPost(threadId)
        .then(function(post) {
          return server.methods.common.posts.hasPriority(server, auth, acl, post.id);
        });
      },
      args: [server, auth, 'threads.lock.bypass.owner.priority', threadId]
    }
  ];
  var owner = server.authorization.stitch(Boom.forbidden(), ownerCond, 'any');

  return Promise.all([allowed, read, write, notBannedFromBoard, active, owner]);
};
