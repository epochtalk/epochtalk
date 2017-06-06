var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function (server, auth, params, payload) {
  var threadId = params.thread_id;
  var pollId = params.poll_id;
  var answerLength = payload.answer_ids.length;
  var userId = auth.credentials.id;

  // check base permission
  var allowed = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'threads.vote.allow'
  });

  // read board
  var read = server.authorization.build({
    error: Boom.notFound('Board Not Found'),
    type: 'dbValue',
    method: server.db.threads.getThreadsBoardInBoardMapping,
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

  // Check if has voted already
  var vote = server.db.polls.hasVoted(threadId, userId)
  .then(function(voted) {
    if (!voted) { return true; }
    else { return Promise.reject(Boom.forbidden('Already Voted')); }
  });

  // Check if poll is unlocked
  var unlocked = server.db.polls.isLocked(pollId)
  .then(function(locked) {
    if (!locked) { return true; }
    else { return Promise.reject(Boom.forbidden('Poll is Locked')); }
  });

  // Check if poll is still running
  var running = server.db.polls.isRunning(pollId)
  .then(function(running) {
    if (running) { return true; }
    else { return Promise.reject(Boom.forbidden('Poll is Expired')); }
  });

  // Check if vote is valid
  var valid = server.db.polls.maxAnswers(pollId)
  .then(function(maxAnswers) {
    if (maxAnswers && maxAnswers >= answerLength) { return true; }
    else { return Promise.reject(Boom.badRequest('Too Many Answers')); }
  });

  return Promise.all([allowed, read, notBannedFromBoard, active, exists, vote, unlocked, running, valid]);
};
