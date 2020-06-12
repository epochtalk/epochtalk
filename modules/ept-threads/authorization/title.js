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
    permission: 'threads.title.allow'
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

  // User has priority and moderator permission
  var standardModCond = [
    {
      // permission based override
      error: Boom.forbidden(),
      type: 'isMod',
      method: server.db.moderators.isModeratorWithThreadId,
      args: [userId, threadId],
      permission: 'threads.title.bypass.owner.mod'
    },
    {
      type: 'runValidation',
      method: function(server, auth, acl, threadId) {
        return server.db.threads.getThreadFirstPost(threadId)
        .then(function(post) {
          return server.methods.common.posts.hasPriority(server, auth, acl, post.id);
        });
      },
      args: [server, auth, 'threads.title.bypass.owner.mod', threadId]
    }
  ];
  var standardMod = server.authorization.stitch(Boom.forbidden(), standardModCond, 'all');

  // is thread owner
  var ownerCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'threads.title.bypass.owner.admin'
    },
    {
      // is owner
      type: 'isThreadOwner',
      method: server.db.threads.getThreadOwner,
      args: [threadId],
      userId: userId,
    },
    standardMod,
    {
      type: 'runValidation',
      method: function(server, auth, acl, threadId) {
        return server.db.threads.getThreadFirstPost(threadId)
        .then(function(post) {
          return server.methods.common.posts.hasPriority(server, auth, acl, post.id);
        });
      },
      args: [server, auth, 'threads.title.bypass.owner.priority', threadId]
    }
  ];
  var owner = server.authorization.stitch(Boom.forbidden(), ownerCond, 'any');

  // is thread locked
  var tLockedCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'threads.title.bypass.owner.admin'
    },
    standardMod,
    {
      type: 'runValidation',
      method: function(server, auth, acl, threadId) {
        return server.db.threads.getThreadFirstPost(threadId)
        .then(function(post) {
          return server.methods.common.posts.hasPriority(server, auth, acl, post.id);
        });
      },
      args: [server, auth, 'threads.title.bypass.owner.priority', threadId]
    },
    {
      // is thread locked
      type: 'dbNotProp',
      method: server.db.threads.find,
      args: [threadId],
      prop: 'locked'
    },
  ];
  var tLocked = server.authorization.stitch(Boom.forbidden('Thread is locked'), tLockedCond, 'any');

  // is board locked
  var bLockedCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'threads.title.bypass.owner.admin'
    },
    standardMod,
    {
      type: 'runValidation',
      method: function(server, auth, acl, threadId) {
        return server.db.threads.getThreadFirstPost(threadId)
        .then(function(post) {
          return server.methods.common.posts.hasPriority(server, auth, acl, post.id);
        });
      },
      args: [server, auth, 'threads.title.bypass.owner.priority', threadId]
    },
    {
      // is board post editing locked
      type: 'dbNotProp',
      method: function(threadId) {
        var postCreatedAt;
        return server.db.threads.getThreadFirstPost(threadId)
        .then(function(post) {
          postCreatedAt = new Date(post.created_at);
          return server.db.threads.find(threadId)
        })
        .then(function(thread) {
          return server.db.boards.find(thread.board_id)
          .then(function(board) {
            var disable = false;
            // Shim for old disablePostEdit
            if (board.disable_post_edit === true) { disable = true; }
            // Check time on disablePostEdit
            else if (board.disable_post_edit && Number(board.disable_post_edit) > -1) {
              var currentTime = new Date().getTime();
              var minutes = Number(board.disable_post_edit) * 60 * 1000;
              var postCreatedAt = new Date(post.created_at).getTime();
              disable = currentTime - postCreatedAt >= minutes;
            }
            return { disable_post_edit: disable }
          });
        });
      },
      args: [threadId],
      prop: 'disable_post_edit'
    }
  ];
  var bLocked = server.authorization.stitch(Boom.forbidden('Editing is disabled for this board'), bLockedCond, 'any');


  // get thread first post
  var first = server.db.threads.getThreadFirstPost(threadId)
  .error(function() { return Promise.reject(Boom.notFound()); });

  return Promise.all([allowed, read, write, notBannedFromBoard, active, owner, bLocked, tLocked, first])
  .then(function(data) {
    var firstPost = data[8];
    return firstPost;
  });
};
