var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function (server, auth, params, payload) {
  var poll = payload;
  var pollId = params.poll_id;
  var threadId = params.thread_id;
  var userId = auth.credentials.id;

  // check base permission
  var allowed = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'threads.editPoll.allow'
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

  // Check that user isn't banned from this board
  var notBannedFromBoard = server.authorization.common.isNotBannedFromBoard(Boom.forbidden('You are banned from this board'), server, userId, { threadId: threadId });

  // Check if has poll exists
  var exists = server.db.polls.exists(threadId)
  .then(function(exists) {
    if (exists) { return true; }
    else { return Promise.reject(Boom.badRequest('Poll Does Not Exists')); }
  });

  // User has priority and moderator permission
  var standardModCond = [
    {
      // permission based override
      error: Boom.forbidden(),
      type: 'isMod',
      method: server.db.moderators.isModeratorWithThreadId,
      args: [userId, threadId],
      permission: 'threads.editPoll.bypass.owner.mod'
    },
    {
      type: 'runValidation',
      method: function(server, auth, acl, threadId) {
        return server.db.threads.getThreadFirstPost(threadId)
        .then(function(post) {
          return server.methods.common.posts.hasPriority(server, auth, acl, post.id);
        });
      },
      args: [server, auth, 'threads.editPoll.bypass.owner.mod', threadId]
    }
  ];
  var standardMod = server.authorization.stitch(Boom.forbidden(), standardModCond, 'all');

  // is poll owner
  var ownerCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'threads.editPoll.bypass.owner.admin'
    },
    {
      // is thread owner
      type: 'isThreadOwner',
      method: server.db.threads.getThreadOwner,
      args: [threadId],
      userId: userId
    },
    standardMod
  ];
  var owner = server.authorization.stitch(Boom.forbidden(), ownerCond, 'any');

  // validate display mode
  var display = new Promise(function(resolve, reject) {
    if (!poll) { return resolve(); }
    if (poll.display_mode === 'expired' && !poll.expiration) {
      return reject(Boom.badRequest('Showing results after expiration requires an expiration'));
    }
    else { return resolve(poll); }
  });

  // validate max answers update // TODO: limit low end of maxAnswers?
  var answers = server.db.polls.answers(pollId)
  .then(function(pollAnswers) {
    var maxAnswers = payload.max_answers;
    var answersLength = pollAnswers.length;
    if (maxAnswers > answersLength) { payload.max_answers = answersLength; }
  });

  return Promise.all([allowed, read, write, notBannedFromBoard, active, exists, owner, display, answers]);
};
