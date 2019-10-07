var Boom = require('boom');
var Promise = require('bluebird');
var path = require('path');
var common = require(path.normalize(__dirname + '/../common'));

module.exports = function postsPurge(server, auth, postId) {
  var userId = auth.credentials.id;

  // check base permission
  var allowed = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'posts.purge.allow'
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

  // is not first post
  var notFirst = server.authorization.build({
    error: Boom.forbidden(),
    type: 'isNotFirstPost',
    method: server.db.posts.getThreadFirstPost,
    args: [postId]
  });

  // User has priority and moderator permission
  var standardModCond = [
    {
      // permission based override
      error: Boom.forbidden(),
      type: 'isMod',
      method: server.db.moderators.isModeratorWithPostId,
      args: [userId, postId],
      permission: 'posts.delete.bypass.owner.mod'
    },
    {
      type: 'runValidation',
      method: common.hasPriority,
      args: [server, auth, 'posts.delete.bypass.owner.mod', postId]
    }
  ];
  var standardMod = server.authorization.stitch(Boom.forbidden(), standardModCond, 'all');

  var purgeCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.purge.bypass.purge.admin'
    },
    standardMod
  ];
  var purge = server.authorization.stitch(Boom.forbidden(), purgeCond, 'any');

  return Promise.all([allowed, read, write, active, notFirst, purge]);
};
