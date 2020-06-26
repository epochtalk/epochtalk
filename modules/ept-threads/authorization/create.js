var Boom = require('boom');
var Promise = require('bluebird');

module.exports = function (server, auth, payload) {
  var poll = payload.poll;
  var boardId = payload.board_id;
  var userId = auth.credentials.id;

  // check base permission
  var allowed = server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'threads.create.allow'
  });

  // read board
  var read = server.authorization.build({
    error: Boom.notFound('Board Not Found'),
    type: 'dbValue',
    method: server.db.boards.getBoardInBoardMapping,
    args: [boardId, server.plugins.acls.getUserPriority(auth)]
  });

  // write board
  var write = server.authorization.build({
    error: Boom.forbidden('No Write Access'),
    type: 'dbValue',
    method: server.db.boards.getBoardWriteAccess,
    args: [boardId, server.plugins.acls.getUserPriority(auth)]
  });

  // is requester active
  var active = server.authorization.build({
    error: Boom.forbidden('Account Not Active'),
    type: 'isActive',
    server: server,
    userId: userId
  });

  // board self mod check
  var selfmod = server.authorization.build({
    error: Boom.forbidden('Board does not allow self moderated threads'),
    type: 'dbValue',
    method: function(boardId) {
      return server.db.boards.find(boardId)
      .then(function(board) {
        if (payload.moderated && board.disable_selfmod) {
          return false;
        }
        else { return true; }
      });
    },
    args: [boardId]
  });

  // user is not banned from this board
  var notBannedFromBoard = server.authorization.common.isNotBannedFromBoard(Boom.forbidden('You are banned from this board'), server, userId, { boardId: boardId });

  // poll based authorization
  var pollCond = [
    // poll createable
    new Promise(function(resolve, reject) {
      if (!poll) { return resolve(); }
      var canCreate = server.plugins.acls.getACLValue(auth, 'threads.createPoll.allow');
      if (!canCreate) { return reject(Boom.forbidden()); }
      else { return resolve(poll); }
    }),
    // validate poll max answers
    new Promise(function(resolve) {
      if (!poll) { return resolve(); }
      var maxAnswers = poll.max_answers;
      var answersLength = poll.answers.length;
      if (maxAnswers > answersLength) { poll.max_answers = answersLength; }
      return resolve(poll);
    }),
    // validate Display Mode
    new Promise(function(resolve, reject) {
      if (!poll) { return resolve(); }
      if (poll.display_mode === 'expired' && !poll.expiration) {
        return reject(Boom.badRequest('Showing results after expiration requires an expiration'));
      }
      else { return resolve(poll); }
    })
  ];
  var pollData = server.authorization.stitch(Boom.badRequest(), pollCond, 'all')
  .then(function() { return poll; });

  // can moderate
  var moderated = new Promise(function(resolve, reject) {
    if (!payload.moderated) { return resolve(); }
    var hasPrivilege = server.plugins.acls.getACLValue(auth, 'threads.moderated.allow');
    if (hasPrivilege) { return resolve(true); }
    else { return reject(Boom.forbidden()); }
  });

  return Promise.all([allowed, read, write, selfmod, notBannedFromBoard, active, pollData, moderated]);
};
