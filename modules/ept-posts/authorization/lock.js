var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function postsPurge(server, auth, postId) {
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

  var lockCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.lock.bypass.lock.admin'
    },
    {
      // is board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithPostId,
      args: [userId, postId],
      permission: server.plugins.acls.getACLValue(auth, 'posts.lock.bypass.lock.mod')
    },
    // is patroller
    hasPriority(server, auth, 'posts.lock.bypass.lock.priority', postId)
  ];
  var lock = server.authorization.stitch(Boom.forbidden(), lockCond, 'any');

  return Promise.all([allowed, read, write, active, lock]);
};

function hasPriority(server, auth, permission, postId) {
  var actorPermission = server.plugins.acls.getACLValue(auth, permission);
  if (!actorPermission) { return Promise.reject(Boom.forbidden()); }

  var hasPatrollerRole = false;
  auth.credentials.roles.map(function(role) {
    if (role === 'patroller') { hasPatrollerRole = true; }
  });

  return server.db.roles.posterHasRole(postId, 'newbie')
  .then(function(posterIsNewbie) {
    if (hasPatrollerRole && posterIsNewbie) { return true; }
    else { return Promise.reject(Boom.forbidden()); }
  });
}
