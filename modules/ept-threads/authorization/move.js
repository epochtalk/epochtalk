var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function (server, auth, threadId, newBoardId) {
  var userId = auth.credentials.id;

  // check base permission
  var allowed = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'threads.move.allow'
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

  var modCondition = [
    {
      // is mod of current board
      type: 'isMod',
      method: server.db.moderators.isModeratorWithThreadId,
      args: [userId, threadId],
      permission: server.plugins.acls.getACLValue(auth, 'threads.move.bypass.owner.mod')
    },
    {
      // is mod of new board
      type: 'isMod',
      method: server.db.moderators.isModeratorWithBoardId,
      args: [userId, newBoardId],
      permission: server.plugins.acls.getACLValue(auth, 'threads.move.bypass.owner.mod')
    }
  ];
  var moderator = server.authorization.stitch(Boom.forbidden(), modCondition, 'all');

  var conditions = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'threads.move.bypass.owner.admin'
    },
    moderator
  ];
  var owner = server.authorization.stitch(Boom.badRequest(), conditions, 'any');

  var notBannedFromBoard = server.authorization.common.isNotBannedFromBoard(Boom.forbidden('You are banned from this board'), server, userId, { threadId: threadId });

  return Promise.all([allowed, read, write, active, owner, notBannedFromBoard]);
};
