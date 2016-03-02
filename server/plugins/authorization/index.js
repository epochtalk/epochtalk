var Joi = require('joi');
var _ = require('lodash');
var Boom = require('boom');
var bcrypt = require('bcrypt');
var Promise = require('bluebird');
var querystring = require('querystring');

var common = {
  hasPermission: (error, server, auth, permission) => {
    return new Promise(function(resolve, reject) {
      var all = server.plugins.acls.getACLValue(auth, permission);
      if (all) { return resolve(all); }
      else { return reject(error); }
    });
  },
  dbValue: (error, method, args) => {
    return method(...args)
    .then(function(value) {
      if (value) { return value; }
      else { return Promise.reject(error); }
    });
  },
  dbProp: (error, method, args, prop) => {
    return method(...args)
    .then(function(value) {
      if (value && value[prop]) { return true; }
      else { return Promise.reject(error); }
    });
  },
  dbNotProp: (error, method, args, prop) => {
    return method(...args)
    .then(function(value) {
      if (value && value[prop]) { return Promise.reject(error); }
      else { return true; }
    });
  },
  isMod: (error, method, args, permission) => {
    return method(...args)
    .then(function(mod) {
      if (mod && permission) { return true; }
      else { return Promise.reject(error); }
    });
  },
  validatePassword: (error, server, userId, password) => {
    return server.db.users.find(userId)
    .then(function(user) {
      if (bcrypt.compareSync(password, user.passhash)) { return true; }
      else { return Promise.reject(error); }
    })
    .error(function() { return Promise.reject(Boom.notFound()); });
  },
  isUnique: (error, method, args, userId) => {
    return method(...args)
    .then(function(user) {
      if (user && user.id !== userId) { return Promise.reject(error); }
      else { return true; }
    });
  },
  isActive: (error, server, userId) => {
    return server.db.users.find(userId)
    .then((user) => {
      if (!user.deleted) { return true; }
      else { return Promise.reject(error); }
    })
    .error(() => { return Promise.reject(Boom.notFound()); });
  },
  isInactive: (error, server, userId) => {
    return server.db.users.find(userId)
    .then((user) => {
      if (user.deleted) { return true; }
      else { return Promise.reject(error); }
    })
    .error(function() { return Promise.reject(Boom.notFound()); });
  },
  isAccountActive: (error, server, username, userId) => {
    return server.db.users.userByUsername(username)
    .then(function(user) {
      if (user && user.id === userId) { return true; }
      else if (user && !user.deleted) { return true; }
      else { return Promise.reject(error); }
    });
  },
  isOwner: (error, method, args, userId) => {
    return method(...args)
    .then(function(value) {
      if (value.user.id === userId) { return true; }
      else { return Promise.reject(error); }
    });
  },
  isThreadOwner: (error, method, args, userId) => {
    return method(...args)
    .then(function(value) {
      if (value.user_id === userId) { return true; }
      else { return Promise.reject(error); }
    });
  },
  isNotFirstPost: (error, method, args) => {
    return method(...args)
    .then(function(value) {
      if (value.id === args[0]) { return Promise.reject(error); }
      else { return true; }
    });
  },
  isNotBannedFromBoard: (error, server, userId, opts) => {
    return server.db.users.isNotBannedFromBoard(userId, opts)
    .then((notBanned) => {
      if (notBanned) { return true; }
      else { return Promise.reject(error); }
    });
  }
};

function build(opts) {
  var promise;
  var error = opts.error;

  switch(opts.type) {
    case 'hasPermission':
      promise = common[opts.type](error, opts.server, opts.auth, opts.permission);
      break;
    case 'isNotFirstPost':
    case 'dbValue':
      promise = common[opts.type](error, opts.method, opts.args);
      break;
    case 'dbProp':
    case 'dbNotProp':
      promise = common[opts.type](error, opts.method, opts.args, opts.prop);
      break;
    case 'isMod':
      promise = common[opts.type](error, opts.method, opts.args, opts.permission);
      break;
    case 'isOwner':
    case 'isThreadOwner':
    case 'isUnique':
      promise = common[opts.type](error, opts.method, opts.args, opts.userId);
      break;
    case 'validatePassword':
      promise = common[opts.type](error, opts.server, opts.userId, opts.password);
      break;
    case 'isActive':
    case 'isInactive':
      promise = common[opts.type](error, opts.server, opts.userId);
      break;
    case 'isAccountActive':
      promise = common[opts.type](error, opts.server, opts.username, opts.userId);
      break;
    default:
      promise = Promise.reject(Boom.badImplementation('Incorrect Format'));
      break;
  }

  return promise;
}

function stitch(error, conditions, type) {
  conditions = conditions.map((condition) => {
    if (!condition.type) { return condition; }
    condition.error = condition.error || error;
    return build(condition);
  });

  if (type === 'all') { return Promise.all(conditions); }
  else if (type === 'any') {
    return Promise.any(conditions)
    .catch(() => { return Promise.reject(error); });
  }
}

// -- WATCHLIST

function watchBoard(server, auth, boardId) {
  var userId = auth.credentials.id;
  var priority = server.plugins.acls.getUserPriority(auth);
  var some = server.plugins.acls.getACLValue(auth, 'boards.viewUncategorized.some');

  var conditions = [
    {
      // Permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'boards.viewUncategorized.all'
    },
    {
      // is the board visible
      type: 'dbValue',
      method: server.db.boards.getBoardInBoardMapping,
      args: [boardId, priority]
    },
    {
      // is this user a board moderator
      type: 'isMod',
      method: server.db.moderators.isModerator,
      args: [userId, boardId],
      permission: some
    }
  ];

  return server.authorization.stitch(Boom.notFound(), conditions, 'any');
}

function watchThread(server, auth, threadId) {
  var userId = auth.credentials.id;
  var priority = server.plugins.acls.getUserPriority(auth);
  var some = server.plugins.acls.getACLValue(auth, 'boards.viewUncategorized.some');

  var conditions = [
    {
      // Permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'boards.viewUncategorized.all'
    },
    {
      // is the board visible
      type: 'dbValue',
      method: server.db.threads.getThreadsBoardInBoardMapping,
      args: [threadId, priority]
    },
    {
      // is this user a board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithThreadId,
      args: [userId, threadId],
      permission: some
    }
  ];

  return server.authorization.stitch(Boom.notFound(), conditions, 'any');
}

// -- USERS

function userUpdate(server, auth, payload) {
  var error = Boom.badRequest();
  var userId = auth.credentials.id;

  var conditions = [];

  // old password valid
  var validatePassword = true;
  if (payload.old_password) {
    validatePassword = {
      type: 'validatePassword',
      server: server,
      userId: userId,
      password: payload.old_password
    };
  }
  conditions.push(validatePassword);

  // new username unique
  var uniqueUsername = true;
  if (payload.username) {
    uniqueUsername = {
      type: 'isUnique',
      method: server.db.users.userByUsername,
      args: [querystring.unescape(payload.username)],
      userId: userId
    };
  }
  conditions.push(uniqueUsername);

  // new email unique
  var uniqueEmail = true;
  if (payload.email) {
    uniqueEmail = {
      type: 'isUnique',
      method: server.db.users.userByEmail,
      args: [payload.email],
      userId: userId
    };
  }
  conditions.push(uniqueEmail);

  // is this profile's account active
  var requesterActive;
  if (auth.isAuthenticated) {
    requesterActive = server.authorization.common.isActive(Boom.forbidden('Account Not Active'), server, userId);
  }
  else { requesterActive = Promise.reject(Boom.unauthorized()); }
  conditions.push(requesterActive);

  return server.authorization.stitch(error, conditions, 'all');
}

function userFind(server, auth, params) {
  // try mode on: must check user is authed

  var userId;
  if (auth.isAuthenticated) { userId = auth.credentials.id; }

  var conditions = [
    {
      // is the user account we're looking for active
      type: 'isAccountActive',
      server: server,
      username: querystring.unescape(params.username),
      userId: userId
    },
    {
      // Permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'users.viewDeleted'
    }
  ];

  return server.authorization.stitch(Boom.notFound(), conditions, 'any');
}

function userDeactivate(server, auth, userId) {
  // -- is User Account Active
  var error = Boom.badRequest('Account Already Inactive');
  var isActive = server.authorization.common.isActive(error, server, userId);

  // -- does the requester have the authority to deactivate
  var paramUserId = userId;
  var authedUserId = auth.credentials.id;
  var same = server.plugins.acls.getACLValue(auth, 'users.privilegedDeactivate.samePriority');
  var lower = server.plugins.acls.getACLValue(auth, 'users.privilegedDeactivate.lowerPriority');

  // check if user is deactivating their own page
  var sameUser = () => {
    return new Promise(function(resolve, reject) {
      if (paramUserId === authedUserId) { return resolve(); }
      else { return reject(Boom.badRequest()); }
    });
  };

  // get referenced user's priority
  var paramPriority = server.db.users.find(paramUserId)
  .then(function(paramUser) { return _.min(_.map(paramUser.roles, 'priority')); })
  .error(() => { return Promise.reject(Boom.badRequest()); });

  // get authed user's priority
  var authedPriority = server.db.users.find(authedUserId)
  .then(function(authUser) { return _.min(_.map(authUser.roles, 'priority')); })
  .error(() => { return Promise.reject(Boom.badRequest()); });

  var promise = Promise.join(paramPriority, authedPriority, function(paramId, authedId) {
    // current has same or higher priority than referenced
    if (same && authedId <= paramId) { return; }
    // current has higher priority than referenced
    else if (lower && authedId < paramId) { return; }
    else { return Promise.reject(Boom.badRequest()); }
  });

  // Scenario 1: This is the user
  // Scenario 2 & 3: same or lower priority win
  var canDeactivate = Promise.any([sameUser(), promise])
  .catch(() => { return Promise.reject(Boom.badRequest()); });

  return Promise.all([isActive, canDeactivate]);
}

function userActivate(server, auth, userId) {
  // -- is User Account Inactive
  var error = Boom.badRequest('Account Already Active');
  var isInactive = server.authorization.common.isInactive(error, server, userId);

  // -- does the requester have the authority to activate
  var paramUserId = userId;
  var authedUserId = auth.credentials.id;
  var same = server.plugins.acls.getACLValue(auth, 'users.privilegedReactivate.samePriority');
  var lower = server.plugins.acls.getACLValue(auth, 'users.privilegedReactivate.lowerPriority');

  // check if user is activating their own page
  var sameUser = () => {
    return new Promise(function(resolve, reject) {
      if (paramUserId === authedUserId) { return resolve(); }
      else { return reject(Boom.badRequest()); }
    });
  };

  // get referenced user's priority
  var paramPriority = server.db.users.find(paramUserId)
  .then(function(paramUser) { return _.min(_.map(paramUser.roles, 'priority')); })
  .error(() => { return Promise.reject(Boom.badRequest()); });

  // get authed user's priority
  var authedPriority = server.db.users.find(authedUserId)
  .then(function(authUser) { return _.min(_.map(authUser.roles, 'priority')); })
  .error(() => { return Promise.reject(Boom.badRequest()); });

  var promise = Promise.join(paramPriority, authedPriority, function(paramId, authedId) {
    // current has same or higher priority than referenced
    if (same && authedId <= paramId) { return; }
    // current has higher priority than referenced
    else if (lower && authedId < paramId) { return; }
    else { return Promise.reject(Boom.badRequest()); }
  });

  // Scenario 1: This is the user
  // Scenario 2 & 3: same or lower priority win
  var canActivate = Promise.any([sameUser(), promise])
  .catch(() => { return Promise.reject(Boom.badRequest()); });

  return Promise.all([isInactive, canActivate]);
}

// -- Threads

function threadsCreate(server, auth, payload) {
  var poll = payload.poll;
  var boardId = payload.board_id;
  var userId = auth.credentials.id;

  // access board
  var accessCond = [
    {
      // Permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'boards.viewUncategorized.all'
    },
    {
      // is the board visible
      type: 'dbValue',
      method: server.db.boards.getBoardInBoardMapping,
      args: [boardId, server.plugins.acls.getUserPriority(auth)]
    },
    {
      // is this user a board moderator
      type: 'isMod',
      method: server.db.moderators.isModerator,
      args: [userId, boardId],
      permission: server.plugins.acls.getACLValue(auth, 'boards.viewUncategorized.some')
    }
  ];

  var access = server.authorization.stitch(Boom.badRequest(), accessCond, 'any');

  // user is not banned from this board
  var notBannedFromBoard = server.authorization.common.isNotBannedFromBoard(Boom.forbidden('You are banned from this board'), server, userId, { boardId: boardId });

  // is requester active
  var active = server.authorization.common.isActive(Boom.forbidden('Account Not Active'), server, userId);

  // poll based authorization
  var pollCond = [
    // poll createable
    new Promise(function(resolve, reject) {
      if (!poll) { return resolve(); }
      var canCreate = server.plugins.acls.getACLValue(auth, 'polls.create');
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
    var hasPrivilege = server.plugins.acls.getACLValue(auth, 'threads.moderated');
    if (hasPrivilege) { return resolve(true); }
    else { return reject(Boom.forbidden()); }
  });

  return Promise.all([access, notBannedFromBoard, active, pollData, moderated]);
}

function threadsByBoard(server, auth, boardId) {
  var userId;
  if (auth.isAuthenticated) { userId = auth.credentials.id; }

  // access board
  var accessCond = [
    {
      // Permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'boards.viewUncategorized.all'
    },
    {
      // is the board visible
      type: 'dbValue',
      method: server.db.boards.getBoardInBoardMapping,
      args: [boardId, server.plugins.acls.getUserPriority(auth)]
    },
    {
      // is this user a board moderator
      type: 'isMod',
      method: server.db.moderators.isModerator,
      args: [userId, boardId],
      permission: server.plugins.acls.getACLValue(auth, 'boards.viewUncategorized.some')
    }
  ];

  return server.authorization.stitch(Boom.badRequest(), accessCond, 'any');
}

function threadsPosted(server, auth) {
  return server.plugins.acls.getUserPriority(auth);
}

function threadsViewed(server, auth, threadId) {
  // try mode on
  var userId;
  if (auth.isAuthenticated) { userId = auth.credentials.id; }

  // Access to board with thread id
  var accessCond = [
    {
      // Permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'boards.viewUncategorized.all'
    },
    {
      // is the board visible
      type: 'dbValue',
      method: server.db.threads.getThreadsBoardInBoardMapping,
      args: [threadId, server.plugins.acls.getUserPriority(auth)]
    },
    {
      // is this user a board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithThreadId,
      args: [userId, threadId],
      permission: server.plugins.acls.getACLValue(auth, 'boards.viewUncategorized.some')
    }
  ];
  return server.authorization.stitch(Boom.badRequest(), accessCond, 'any');
}

function threadsTitle(server, auth, threadId) {
  var userId = auth.credentials.id;

  // Access to board with thread id
  var accessCond = [
    {
      // Permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'boards.viewUncategorized.all'
    },
    {
      // is the board visible
      type: 'dbValue',
      method: server.db.threads.getThreadsBoardInBoardMapping,
      args: [threadId, server.plugins.acls.getUserPriority(auth)]
    },
    {
      // is this user a board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithThreadId,
      args: [userId, threadId],
      permission: server.plugins.acls.getACLValue(auth, 'boards.viewUncategorized.some')
    }
  ];
  var access = server.authorization.stitch(Boom.badRequest(), accessCond, 'any');

  // user is not banned from this board
  var notBannedFromBoard = server.authorization.common.isNotBannedFromBoard(Boom.forbidden('You are banned from this board'), server, userId, { threadId: threadId });

  // is requester active
  var active = server.authorization.common.isActive(Boom.forbidden('Account Not Active'), server, userId);

  // is thread owner
  var ownerCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'threads.privilegedTitle.all'
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
      permission: server.plugins.acls.getACLValue(auth, 'threads.privilegedTitle.some')
    }
  ];
  var owner = server.authorization.stitch(Boom.forbidden(), ownerCond, 'any');

  // get thread first post
  var first = server.db.threads.getThreadFirstPost(threadId)
  .error(function() { return Promise.reject(Boom.notFound()); });

  return Promise.all([access, notBannedFromBoard, active, owner, first])
  .then(function(data) { return data[4]; });
}

function threadsLock(server, auth, threadId) {
  var userId = auth.credentials.id;

  // Access to board with thread id
  var accessCond = [
    {
      // Permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'boards.viewUncategorized.all'
    },
    {
      // is the board visible
      type: 'dbValue',
      method: server.db.threads.getThreadsBoardInBoardMapping,
      args: [threadId, server.plugins.acls.getUserPriority(auth)]
    },
    {
      // is this user a board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithThreadId,
      args: [userId, threadId],
      permission: server.plugins.acls.getACLValue(auth, 'boards.viewUncategorized.some')
    }
  ];
  var access = server.authorization.stitch(Boom.badRequest(), accessCond, 'any');

  // user is not banned from this board
  var notBannedFromBoard = server.authorization.common.isNotBannedFromBoard(Boom.forbidden('You are banned from this board'), server, userId, { threadId: threadId });

  // is requester active
  var active = server.authorization.common.isActive(Boom.forbidden('Account Not Active'), server, userId);

  // is thread owner
  var ownerCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'threads.privilegedLock.all'
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
      permission: server.plugins.acls.getACLValue(auth, 'threads.privilegedLock.some')
    }
  ];
  var owner = server.authorization.stitch(Boom.forbidden(), ownerCond, 'any');

  return Promise.all([access, notBannedFromBoard, active, owner]);
}

function threadsSticky(server, auth, threadId) {
  var userId = auth.credentials.id;

  var conditions = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'threads.privilegedSticky.all'
    },
    {
      // is this user a board moderator
      error: Boom.badRequest(),
      type: 'isMod',
      method: server.db.moderators.isModeratorWithThreadId,
      args: [userId, threadId],
      permission: server.plugins.acls.getACLValue(auth, 'threads.privilegedSticky.some')
    }
  ];

  var access = server.authorization.stitch(Boom.badRequest(), conditions, 'any');

  var notBannedFromBoard = server.authorization.common.isNotBannedFromBoard(Boom.forbidden('You are banned from this board'), server, userId, { threadId: threadId });

  return Promise.all([access, notBannedFromBoard]);
}

function threadsMove(server, auth, threadId) {
  var userId = auth.credentials.id;

  var conditions = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'threads.privilegedMove.all'
    },
    {
      // is this user a board moderator
      error: Boom.badRequest(),
      type: 'isMod',
      method: server.db.moderators.isModeratorWithThreadId,
      args: [userId, threadId],
      permission: server.plugins.acls.getACLValue(auth, 'threads.privilegedMove.some')
    }
  ];
  var access = server.authorization.stitch(Boom.badRequest(), conditions, 'any');

  var notBannedFromBoard = server.authorization.common.isNotBannedFromBoard(Boom.forbidden('You are banned from this board'), server, userId, { threadId: threadId });

  return Promise.all([access, notBannedFromBoard]);
}

function threadsPurge(server, auth, threadId) {
  var userId = auth.credentials.id;

  var conditions = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'threads.privilegedPurge.all'
    },
    {
      // is this user a board moderator
      error: Boom.badRequest(),
      type: 'isMod',
      method: server.db.moderators.isModeratorWithThreadId,
      args: [userId, threadId],
      permission: server.plugins.acls.getACLValue(auth, 'threads.privilegedPurge.some')
    }
  ];
  var access = server.authorization.stitch(Boom.badRequest(), conditions, 'any');

  var notBannedFromBoard = server.authorization.common.isNotBannedFromBoard(Boom.forbidden('You are banned from this board'), server, userId, { threadId: threadId });

  return Promise.all([access, notBannedFromBoard]);
}

function threadsVote(server, auth, params, payload) {
  var threadId = params.threadId;
  var pollId = params.pollId;
  var answerLength = payload.answerIds.length;
  var userId = auth.credentials.id;

  // Access to board with thread id
  var accessCond = [
    {
      // Permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'boards.viewUncategorized.all'
    },
    {
      // is the board visible
      type: 'dbValue',
      method: server.db.threads.getThreadsBoardInBoardMapping,
      args: [threadId, server.plugins.acls.getUserPriority(auth)]
    },
    {
      // is this user a board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithThreadId,
      args: [userId, threadId],
      permission: server.plugins.acls.getACLValue(auth, 'boards.viewUncategorized.some')
    }
  ];
  var access = server.authorization.stitch(Boom.forbidden(), accessCond, 'any');

  // Check that user isn't banned from this board
  var notBannedFromBoard = server.authorization.common.isNotBannedFromBoard(Boom.forbidden('You are banned from this board'), server, userId, { threadId: threadId });

  // is requester active
  var active = server.authorization.common.isActive(Boom.forbidden('Account Not Active'), server, userId);

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

  return Promise.all([access, notBannedFromBoard, active, exists, vote, unlocked, running, valid]);
}

function threadsRemoveVote(server, auth, threadId, pollId) {
  var userId = auth.credentials.id;

  // Access to board with thread id
  var accessCond = [
    {
      // Permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'boards.viewUncategorized.all'
    },
    {
      // is the board visible
      type: 'dbValue',
      method: server.db.threads.getThreadsBoardInBoardMapping,
      args: [threadId, server.plugins.acls.getUserPriority(auth)]
    },
    {
      // is this user a board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithThreadId,
      args: [userId, threadId],
      permission: server.plugins.acls.getACLValue(auth, 'boards.viewUncategorized.some')
    }
  ];
  var access = server.authorization.stitch(Boom.forbidden(), accessCond, 'any');

  // Check that user isn't banned from this board
  var notBannedFromBoard = server.authorization.common.isNotBannedFromBoard(Boom.forbidden('You are banned from this board'), server, userId, { threadId: threadId });

  // is requester active
  var active = server.authorization.common.isActive(Boom.forbidden('Account Not Active'), server, userId);

  // Check if has poll exists
  var exists = server.db.polls.exists(threadId)
  .then(function(exists) {
    if (exists) { return true; }
    else { return Promise.reject(Boom.badRequest('Poll Does Not Exists')); }
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

  // Check if vote can be removed
  var change = server.db.polls.changeVote(pollId)
  .then(function(changeVote) {
    if (changeVote) { return true; }
    else { return Promise.reject(Boom.badRequest('Votes cannot be changed')); }
  });

  return Promise.all([access, notBannedFromBoard, active, exists, unlocked, running, change]);
}

function threadsEditPoll(server, auth, params, payload) {
  var poll = payload;
  var pollId = params.pollId;
  var threadId = params.threadId;
  var userId = auth.credentials.id;

  // Access to board with thread id
  var accessCond = [
    {
      // Permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'boards.viewUncategorized.all'
    },
    {
      // is the board visible
      type: 'dbValue',
      method: server.db.threads.getThreadsBoardInBoardMapping,
      args: [threadId, server.plugins.acls.getUserPriority(auth)]
    },
    {
      // is this user a board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithThreadId,
      args: [userId, threadId],
      permission: server.plugins.acls.getACLValue(auth, 'boards.viewUncategorized.some')
    }
  ];
  var access = server.authorization.stitch(Boom.forbidden(), accessCond, 'any');

  // Check that user isn't banned from this board
  var notBannedFromBoard = server.authorization.common.isNotBannedFromBoard(Boom.forbidden('You are banned from this board'), server, userId, { threadId: threadId });

  // is requester active
  var active = server.authorization.common.isActive(Boom.forbidden('Account Not Active'), server, userId);

  // Check if has poll exists
  var exists = server.db.polls.exists(threadId)
  .then(function(exists) {
    if (exists) { return true; }
    else { return Promise.reject(Boom.badRequest('Poll Does Not Exists')); }
  });

  // is poll owner
  var ownerCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'polls.privilegedLock.all'
    },
    {
      // is thread owner
      type: 'isThreadOwner',
      method: server.db.threads.getThreadOwner,
      args: [threadId],
      userId: userId
    },
    {
      // is board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithThreadId,
      args: [userId, threadId],
      permission: server.plugins.acls.getACLValue(auth, 'polls.privilegedLock.some')
    }
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

  return Promise.all([access, notBannedFromBoard, active, exists, owner, display, answers]);
}

function threadsCreatePoll(server, auth, threadId, poll) {
  var userId = auth.credentials.id;

  // Access to board with thread id
  var accessCond = [
    {
      // Permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'boards.viewUncategorized.all'
    },
    {
      // is the board visible
      type: 'dbValue',
      method: server.db.threads.getThreadsBoardInBoardMapping,
      args: [threadId, server.plugins.acls.getUserPriority(auth)]
    },
    {
      // is this user a board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithThreadId,
      args: [userId, threadId],
      permission: server.plugins.acls.getACLValue(auth, 'boards.viewUncategorized.some')
    }
  ];
  var access = server.authorization.stitch(Boom.forbidden(), accessCond, 'any');

  // Check that user isn't banned from this board
  var notBannedFromBoard = server.authorization.common.isNotBannedFromBoard(Boom.forbidden('You are banned from this board'), server, userId, { threadId: threadId });

  // is requester active
  var active = server.authorization.common.isActive(Boom.forbidden('Account Not Active'), server, userId);

  // can create poll
  var getThreadOwner = server.db.threads.getThreadOwner(threadId);
  var getPollExists = server.db.polls.exists(threadId);
  var create = Promise.join(getThreadOwner, getPollExists, function(owner, pollExists) {
    if (pollExists) { return Promise.reject(Boom.badRequest('Poll already exists')); }
    else if (owner.user_id === userId) { return true; }
    else { return Promise.reject(Boom.forbidden()); }
  })
  .error(() => { return Promise.reject(Boom.notFound()); });

  // poll based authorization
  var pollCond = [
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

  return Promise.all([access, notBannedFromBoard, active, create, pollData]);
}

function threadsLockPoll(server, auth, threadId) {
  var userId = auth.credentials.id;

  // Access to board with thread id
  var accessCond = [
    {
      // Permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'boards.viewUncategorized.all'
    },
    {
      // is the board visible
      type: 'dbValue',
      method: server.db.threads.getThreadsBoardInBoardMapping,
      args: [threadId, server.plugins.acls.getUserPriority(auth)]
    },
    {
      // is this user a board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithThreadId,
      args: [userId, threadId],
      permission: server.plugins.acls.getACLValue(auth, 'boards.viewUncategorized.some')
    }
  ];
  var access = server.authorization.stitch(Boom.forbidden(), accessCond, 'any');

  // Check that user isn't banned from this board
  var notBannedFromBoard = server.authorization.common.isNotBannedFromBoard(Boom.forbidden('You are banned from this board'), server, userId, { threadId: threadId });

  // is requester active
  var active = server.authorization.common.isActive(Boom.forbidden('Account Not Active'), server, userId);

  // Check if has poll exists
  var exists = server.db.polls.exists(threadId)
  .then(function(exists) {
    if (exists) { return true; }
    else { return Promise.reject(Boom.badRequest('Poll Does Not Exists')); }
  });

  // is poll owner
  var ownerCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'polls.privilegedLock.all'
    },
    {
      // is thread owner
      type: 'isThreadOwner',
      method: server.db.threads.getThreadOwner,
      args: [threadId],
      userId: userId
    },
    {
      // is board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithThreadId,
      args: [userId, threadId],
      permission: server.plugins.acls.getACLValue(auth, 'polls.privilegedLock.some')
    }
  ];
  var owner = server.authorization.stitch(Boom.forbidden(), ownerCond, 'any');

  return Promise.all([access, notBannedFromBoard, active, exists, owner]);
}

// -- Messages

function messagesCreate(server, auth, receiverId, convoId) {
  var userId = auth.credentials.id;

  // is a member of the conversation
  var convoMember = server.db.conversations.isConversationMember(convoId, userId)
  .then(function(isMember) {
    if (isMember) { return true; }
    else { return Promise.reject(Boom.forbidden('Not a part of this conversation')); }
  });

  // priority restriction
  var priority;
  var em = 'Action Restricted. Please contact an administrator.';
  var admissions = server.plugins.acls.getPriorityRestrictions(auth);
  if (!admissions || admissions.length <= 0) { priority = Promise.resolve(true); }
  else {
    priority = server.db.users.find(receiverId)
    .then(function(refUser) { return _.min(_.map(refUser.roles, 'priority')); })
    // check if the user being messaged has a priority the authed user has access to msg
    .then(function(refPriority) {
      if (admissions.indexOf(refPriority) >= 0) { return true; }
      else { return Promise.reject(Boom.forbidden(em)); }
    });
  }

  return Promise.all([convoMember, priority]);
}

function messagesDelete(server, auth, messageId) {
  var userId = auth.credentials.id;

  var conditions = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'messages.privilegedDelete'
    },
    // is message owner
    {
      type: 'dbValue',
      method: server.db.messages.isMessageSender,
      args: [messageId, userId]
    }
  ];

  return server.authorization.stitch(Boom.forbidden(), conditions, 'any');
}

// -- Conversations

function conversationsCreate(server, auth, receiverId) {
  // priority restriction
  var priority;
  var em = 'Action Restricted. Please contact an administrator.';
  var admissions = server.plugins.acls.getPriorityRestrictions(auth);
  if (!admissions || admissions.length <= 0) { priority = Promise.resolve(true); }
  else {
    priority = server.db.users.find(receiverId)
    .then(function(refUser) { return _.min(_.map(refUser.roles, 'priority')); })
    // check if the user being messaged has a priority the authed user has access to msg
    .then(function(refPriority) {
      if (admissions.indexOf(refPriority) >= 0) { return true; }
      else { return Promise.reject(Boom.forbidden(em)); }
    });
  }
  return priority;
}

// -- Boards

function boardsFind(server, auth, boardId) {
  var userId = auth.credentials.id;

  var conditions = [
    {
      // Permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'boards.viewUncategorized.all'
    },
    {
      // is the board visible
      type: 'dbValue',
      method: server.db.boards.getBoardInBoardMapping,
      args: [boardId, server.plugins.acls.getUserPriority(auth)]
    },
    {
      // is this user a board moderator
      type: 'isMod',
      method: server.db.moderators.isModerator,
      args: [userId, boardId],
      permission: server.plugins.acls.getACLValue(auth, 'boards.viewUncategorized.some')
    }
  ];

  return server.authorization.stitch(Boom.notFound(), conditions, 'any');
}

function boardsAllCategories(server, auth) {
  return server.plugins.acls.getUserPriority(auth);
}

// -- Auth

function authRegister(server, email, username) {

  // check unique email
  var emailCond = server.db.users.userByEmail(email)
  .then(function(user) {
    if (user) { return Promise.reject(Boom.badRequest('Email Already Exists')); }
    else { return true; }
  });

  // check unique username
  var usernameCond = server.db.users.userByUsername(username)
  .then(function(user) {
    if (user) { return Promise.reject(Boom.badRequest('Username Already Exists')); }
    else { return true;}
  });

  return Promise.all([emailCond, usernameCond]);
}

// -- Admin Users

function adminUsersUpdate(server, auth, payload) {
  // match priority
  var userId = payload.id;
  var currentUserId = auth.credentials.id;
  var samePriority = server.plugins.acls.getACLValue(auth, 'adminUsers.privilegedUpdate.samePriority');
  var lowerPriority = server.plugins.acls.getACLValue(auth, 'adminUsers.privilegedUpdate.lowerPriority');

  // get referenced user's priority
  var refPriority = server.db.users.find(userId)
  .then(function(refUser) { return _.min(_.map(refUser.roles, 'priority')); });

  // get authed user priority
  var curPriority = server.db.users.find(currentUserId)
  .then(function(curUser) { return _.min(_.map(curUser.roles, 'priority')); });

  var match = Promise.join(refPriority, curPriority, samePriority, lowerPriority, function(referenced, current, same, lower) {
    if (userId === currentUserId) { return; }
    // current has same or higher priority than referenced
    if (same && current <= referenced) { return userId; }
    // current has higher priority than referenced
    else if (lower && current < referenced) { return userId; }
    else { return Promise.reject(Boom.forbidden()); }
  });

  // is new username unique admin
  var username = payload.username ? querystring.unescape(payload.username) : undefined;
  var usernameUnique = server.db.users.userByUsername(username)
  .then(function(user) {
    // no username given
    if (!username) { return true; }
    // not unique
    if (user && user.id !== userId) { return Promise.reject(Boom.badRequest()); }
    else { return true; }
  });

  // is new email uniqu admin
  var email = payload.email;
  var emailUnique = server.db.users.userByEmail(email)
  .then(function(user) {
    // no email given
    if (!email) { return true;}
    // not unique
    if (user && user.id !== userId) { return Promise.reject(Boom.badRequest()); }
    else { return true; }
  });

  return Promise.all([match, usernameUnique, emailUnique]);
}

function adminRolesAdd(server, auth, roleId, usernames) {
  var currentUserId = auth.credentials.id;

  // has access to role
  var authedPriority, refRole;
  var accessRole = server.db.users.find(currentUserId)
  // get current user's priority
  .then(function(curUser) { authedPriority = _.min(_.map(curUser.roles, 'priority')); })
  // get all roles
  .then(server.db.roles.all)
  // get role were trying to add users to
  .then(function(roles) { refRole = _.find(roles, _.matchesProperty('id', roleId)); })
  // make sure authed user is adding to a role with their priority or lower
  // this prevents admins from adding themselves/others as super admins
  .then(function() {
    var errMessage = 'You don\'t have permission to add users to the ' + refRole.name + ' role.';
    if (refRole.priority < authedPriority) { return Promise.reject(Boom.forbidden(errMessage)); }
    else { return true; }
  });

  // can add to role
  var addToRole;
  var samePriority = server.plugins.acls.getACLValue(auth, 'adminUsers.privilegedAddRoles.samePriority');
  var lowerPriority = server.plugins.acls.getACLValue(auth, 'adminUsers.privilegedAddRoles.lowerPriority');

  if (!samePriority && !lowerPriority) { addToRole = Promise.reject(Boom.forbidden()); }
  else {
    // get current user's priority
    var currentPriority = server.db.users.find(currentUserId)
    .then(function(curUser) { return _.min(_.map(curUser.roles, 'priority')); });

    // compare the priority of all usernames
    addToRole = Promise.each(usernames, function(username) {
      // short circuit: users can modify themselves
      if (username === auth.credentials.username) { return true; }

      // get each username's priority
      var refPriority = server.db.users.userByUsername(username)
      .then(function(refUser) { return _.min(_.map(refUser.roles, 'priority')); });

      // compare priorities
      return Promise.join(refPriority, currentPriority, function(referenced, current) {
        var err = Boom.forbidden('You don\'t have permission to add roles to ' + username);
        // current has same or higher priority than referenced
        if (samePriority && current <= referenced) { return true; }
        // current has higher priority than referenced
        else if (lowerPriority && current < referenced) { return true; }
        else { return Promise.reject(err); }
      });
    });
  }

  return Promise.all([accessRole, addToRole]);
}

function adminRolesDelete(server, auth, userId) {
  // can delete role from user
  var currentUserId = auth.credentials.id;
  var samePriority = server.plugins.acls.getACLValue(auth, 'adminUsers.privilegedRemoveRoles.samePriority');
  var lowerPriority = server.plugins.acls.getACLValue(auth, 'adminUsers.privilegedRemoveRoles.lowerPriority');

  var promise;
  if (userId === currentUserId) { promise = true; }
  else if (samePriority || lowerPriority) {
    // get current user's priority
    var authedPriority = server.db.users.find(currentUserId)
    .then(function(curUser) { return _.min(_.map(curUser.roles, 'priority')); });

    // get referenced user's priority and username
    var refUsername;
    var refPriority = server.db.users.find(userId)
    .then(function(refUser) {
      refUsername = refUser.username;
      return _.min(_.map(refUser.roles, 'priority'));
    });

    // compare priorities
    promise = Promise.join(refPriority, authedPriority, function(referenced, current) {
      var err = Boom.forbidden('Insufficient permissions to remove role from ' + refUsername);
      // current has same or higher priority than referenced
      if (samePriority && current <= referenced) { return true; }
      // current has higher priority than referenced
      else if (lowerPriority && current < referenced) { return true; }
      else { return Promise.reject(err); }
    });
  }
  else { promise = Promise.reject(Boom.forbidden()); }
  return promise;
}

function adminUsersBan(server, auth, userId) {
  // match priority
  var currentUserId = auth.credentials.id;
  var same = server.plugins.acls.getACLValue(auth, 'adminUsers.privilegedBan.samePriority');
  var lower = server.plugins.acls.getACLValue(auth, 'adminUsers.privilegedBan.lowerPriority');

  // get referenced user's priority
  var refPriority = server.db.users.find(userId)
  .then(function(refUser) { return _.min(_.map(refUser.roles, 'priority')); });

  // get authed user priority
  var curPriority = server.db.users.find(currentUserId)
  .then(function(curUser) { return _.min(_.map(curUser.roles, 'priority')); });

  // compare priorities
  var match = Promise.join(refPriority, curPriority, function(referenced, current) {
    if (userId === currentUserId) { return; }
    // current has same or higher priority than referenced
    if (same && current <= referenced) { return userId; }
    // current has higher priority than referenced
    else if (lower && current < referenced) { return userId; }
    else { return Promise.reject(Boom.forbidden()); }
  });

  return match;
}

function adminUsersBanFromBoards(server, auth, userId, boardIds) {
  // match priority
  var currentUserId = auth.credentials.id;
  var same = server.plugins.acls.getACLValue(auth, 'adminUsers.privilegedBanFromBoards.samePriority');
  var lower = server.plugins.acls.getACLValue(auth, 'adminUsers.privilegedBanFromBoards.lowerPriority');

  // Check if the user has global mod permissions
  var some = server.plugins.acls.getACLValue(auth, 'adminUsers.privilegedBanFromBoards.some');
  var all = server.plugins.acls.getACLValue(auth, 'adminUsers.privilegedBanFromBoards.all');

  // get referenced user's priority
  var refPriority = server.db.users.find(userId)
  .then(function(refUser) { return _.min(_.map(refUser.roles, 'priority')); });

  // get authed user priority
  var curPriority = server.db.users.find(currentUserId)
  .then(function(curUser) { return _.min(_.map(curUser.roles, 'priority')); });


  // compare priorities
  var match = Promise.join(refPriority, curPriority, function(referenced, current) {
    if (userId === currentUserId) { return; }
    // User is a normal mod and try to ban from a board they do not moderate
    if ((!all && some && _.difference(boardIds, auth.credentials.moderating).length) || !all && !some) {
      return Promise.reject(Boom.forbidden('You can only modify user\'s bans for boards you moderate'));
    }

    // current has same or higher priority than referenced
    if (same && current <= referenced) { return userId; }
    // current has higher priority than referenced
    else if (lower && current < referenced) { return userId; }
    else { return Promise.reject(Boom.forbidden()); }
  });

  return match;
}


// -- Admin Roles
// test this one
function adminRolesRemove(roleId){
  var defaultRoleIds = [
    'irXvScLORCGVJLtF8onULA', // Super Administrator
    'BoYOb5rATCqNnEFzQwYvuA', // Administrator
    '-w9wtzZST32hZgXuaOdCjQ', // Global Moderator
    'wNOXcRVBS3GRIq8HNsrSPQ', // Moderator
    '7c2Pd840RDO6hRf5sXo7YA', // User
    'Z6qgHsx0TD2bP1am9lRwmA', // Banned
    '2j9S2kjDRIeFm7uyloUD4Q', // Anonymous
    '80kyFis5QceKXgR1Qo0q9A', // Private
  ];

  var canDelete = true;
  if (defaultRoleIds.indexOf(roleId) > -1) {
    canDelete = Promise.reject(Boom.badRequest('You may not delete the default roles.'));
  }
  return canDelete;
}

function adminRolesValidate(roles, payload) {
  var moduleValidations = roles.validations;

  var schema =  Joi.object().keys({
    priorityRestrictions: Joi.array().items(Joi.number()),
    adminAccess: Joi.object().keys({
      settings: Joi.object().keys({
        general: Joi.boolean(),
        advanced: Joi.boolean(),
        theme: Joi.boolean()
      }),
      management: Joi.object().keys({
        boards: Joi.boolean(),
        users: Joi.boolean(),
        roles: Joi.boolean()
      })
    }),
    modAccess: Joi.object().keys({
      users: Joi.boolean(),
      posts: Joi.boolean(),
      messages: Joi.boolean(),
      boardBans: Joi.boolean(),
      logs: Joi.boolean()
    }),
    adminRoles: Joi.object().keys({
      all: Joi.boolean(),
      users: Joi.boolean(),
      add: Joi.boolean(),
      update: Joi.boolean(),
      remove: Joi.boolean(),
      reprioritize: Joi.boolean()
    }),
    adminBoards: Joi.object().keys({
      categories: Joi.boolean(),
      boards: Joi.boolean(),
      moveBoards: Joi.boolean(),
      updateCategories: Joi.boolean()
    }),
    adminModerationLogs: Joi.object().keys({
      page: Joi.boolean()
    }),
    adminReports: Joi.object().keys({
      createUserReportNote: Joi.boolean(),
      createPostReportNote: Joi.boolean(),
      createMessageReportNote: Joi.boolean(),
      updateUserReport: Joi.boolean(),
      updatePostReport: Joi.boolean(),
      updateMessageReport: Joi.boolean(),
      updateUserReportNote: Joi.boolean(),
      updatePostReportNote: Joi.boolean(),
      updateMessageReportNote: Joi.boolean(),
      pageUserReports: Joi.boolean(),
      pagePostReports: Joi.boolean(),
      pageMessageReports: Joi.boolean(),
      pageUserReportsNotes: Joi.boolean(),
      pagePostReportsNotes: Joi.boolean(),
      pageMessageReportsNotes: Joi.boolean()
    }),
    adminSettings: Joi.object().keys({
      find: Joi.boolean(),
      update: Joi.boolean(),
      getTheme: Joi.boolean(),
      setTheme: Joi.boolean(),
      resetTheme: Joi.boolean(),
      previewTheme: Joi.boolean(),
      getBlacklist: Joi.boolean(),
      addToBlacklist: Joi.boolean(),
      updateBlacklist: Joi.boolean(),
      deleteFromBlacklist: Joi.boolean()
    }),
    adminUsers: Joi.object().keys({
      privilegedUpdate: Joi.object().keys({
        samePriority: Joi.boolean(),
        lowerPriority: Joi.boolean()
      }),
      privilegedBan: Joi.object().keys({
        samePriority: Joi.boolean(),
        lowerPriority: Joi.boolean()
      }),
      privilegedBanFromBoards: Joi.object().keys({
        samePriority: Joi.boolean(),
        lowerPriority: Joi.boolean(),
        some: Joi.boolean(),
        all: Joi.boolean()
      }),
      privilegedAddRoles: Joi.object().keys({
        samePriority: Joi.boolean(),
        lowerPriority: Joi.boolean()
      }),
      privilegedRemoveRoles: Joi.object().keys({
        samePriority: Joi.boolean(),
        lowerPriority: Joi.boolean()
      }),
      update: Joi.boolean(),
      find: Joi.boolean(),
      addRoles: Joi.boolean(),
      removeRoles: Joi.boolean(),
      searchUsernames: Joi.boolean(),
      count: Joi.boolean(),
      countAdmins: Joi.boolean(),
      countModerators: Joi.boolean(),
      page: Joi.boolean(),
      pageAdmins: Joi.boolean(),
      pageModerators: Joi.boolean(),
      ban: Joi.boolean(),
      unban: Joi.boolean(),
      banFromBoards: Joi.boolean(),
      unbanFromBoards: Joi.boolean(),
      getBannedBoards: Joi.boolean(),
      byBannedBoards: Joi.boolean()
    }),
    adminModerators: Joi.object().keys({
      add: Joi.boolean(),
      remove: Joi.boolean()
    }),
    boards: Joi.object().keys({
      viewUncategorized: Joi.object().keys({
        some: Joi.boolean(),
        all: Joi.boolean()
      }),
      create: Joi.boolean(),
      find: Joi.boolean(),
      allCategories: Joi.boolean(),
      update: Joi.boolean(),
      delete: Joi.boolean()
    }),
    categories: Joi.object().keys({
      create: Joi.boolean(),
      find: Joi.boolean(),
      all: Joi.boolean(),
      delete: Joi.boolean()
    }),
    conversations: Joi.object().keys({
      create: Joi.boolean(),
      messages: Joi.boolean(),
      delete: Joi.boolean()
    }),
    messages: Joi.object().keys({
      privilegedDelete: Joi.boolean(),
      create: Joi.boolean(),
      latest: Joi.boolean(),
      findUser: Joi.boolean(),
      delete: Joi.boolean()
    }),
    posts: moduleValidations.posts,
    reports: Joi.object().keys({
      createUserReport: Joi.boolean(),
      createPostReport: Joi.boolean(),
      createMessageReport: Joi.boolean()
    }),
    threads: Joi.object().keys({
      privilegedTitle: Joi.object().keys({
        some: Joi.boolean(),
        all: Joi.boolean()
      }),
      privilegedLock: Joi.object().keys({
        some: Joi.boolean(),
        all: Joi.boolean()
      }),
      privilegedSticky: Joi.object().keys({
        some: Joi.boolean(),
        all: Joi.boolean()
      }),
      privilegedMove: Joi.object().keys({
        some: Joi.boolean(),
        all: Joi.boolean()
      }),
      privilegedPurge: Joi.object().keys({
        some: Joi.boolean(),
        all: Joi.boolean()
      }),
      create: Joi.boolean(),
      byBoard: Joi.boolean(),
      posted: Joi.boolean(),
      viewed: Joi.boolean(),
      title: Joi.boolean(),
      lock: Joi.boolean(),
      sticky: Joi.boolean(),
      move: Joi.boolean(),
      moderated: Joi.boolean(),
      purge: Joi.boolean()
    }),
    users: Joi.object().keys({
      privilegedDeactivate: Joi.object().keys({
        samePriority: Joi.boolean(),
        lowerPriority: Joi.boolean()
      }),
      privilegedReactivate: Joi.object().keys({
        samePriority: Joi.boolean(),
        lowerPriority: Joi.boolean()
      }),
      privilegedDelete: Joi.object().keys({
        samePriority: Joi.boolean(),
        lowerPriority: Joi.boolean()
      }),
      viewDeleted: Joi.boolean(),
      update: Joi.boolean(),
      find: Joi.boolean(),
      deactivate: Joi.boolean(),
      reactivate: Joi.boolean(),
      delete: Joi.boolean()
    }),
    limits: Joi.array().items({
      path: Joi.string().required(),
      method: Joi.string().valid('GET', 'PUT', 'POST', 'DELETE').required(),
      interval: Joi.number().min(-1).required(),
      maxInInterval: Joi.number().min(1).required(),
      minDifference: Joi.number().min(1).optional()
    }).sparse(),
    polls: Joi.object().keys({
      create: Joi.boolean(),
      vote: Joi.boolean(),
      lock: Joi.boolean(),
      privilegedLock: Joi.object().keys({
        some: Joi.boolean(),
        all: Joi.boolean()
      })
    })
  }).required();

  var promise = new Promise(function(resolve, reject) {
    Joi.validate(payload.permissions, schema, { stripUnknown: true }, function(err, value) {
      if (err) { return reject(Boom.badRequest(err)); }
      else {
        payload.permissions = value;
        return resolve();
      }
    });
  });

  return promise;
}

// -- Admin Reports

function adminReportsUpdateNote(server, auth, noteId, type) {
  var userId = auth.credentials.id;

  var promise;
  if (type === 'user') { promise = server.db.reports.findUserReportNote(noteId); }
  else if (type === 'post') { promise = server.db.reports.findPostReportNote(noteId); }
  else if (type === 'message') { promise = server.db.reports.findMessageReportNote(noteId); }

  return promise
  .then(function(note) {
    if (note.user_id === userId) { return true; }
    else { return Promise.reject(Boom.forbidden('Only the author can update this note')); }
  });
}

// -- API

exports.register = function(server, options, next) {
  options = options || {};
  options.methods = options.methods || [];

  // append hardcoded auth methods to the server
  var internalMethods = [
    // -- watchlist
    {
      name: 'auth.watchThread',
      method: watchThread,
      options: { callback: false }
    },
    {
      name: 'auth.watchBoard',
      method: watchBoard,
      options: { callback: false }
    },
    // -- users
    {
      name: 'auth.users.update',
      method: userUpdate,
      options: { callback: false }
    },
    {
      name: 'auth.users.find',
      method: userFind,
      options: { callback: false }
    },
    {
      name: 'auth.users.deactivate',
      method: userDeactivate,
      options: { callback: false }
    },
    {
      name: 'auth.users.activate',
      method: userActivate,
      options: { callback: false }
    },
    // -- threads
    {
      name: 'auth.threads.create',
      method: threadsCreate,
      options: { callback: false }
    },
    {
      name: 'auth.threads.byBoard',
      method: threadsByBoard,
      options: { callback: false }
    },
    {
      name: 'auth.threads.posted',
      method: threadsPosted,
      options: { callback: false }
    },
    {
      name: 'auth.threads.viewed',
      method: threadsViewed,
      options: { callback: false }
    },
    {
      name: 'auth.threads.title',
      method: threadsTitle,
      options: { callback: false }
    },
    {
      name: 'auth.threads.lock',
      method: threadsLock,
      options: { callback: false }
    },
    {
      name: 'auth.threads.sticky',
      method: threadsSticky,
      options: { callback: false }
    },
    {
      name: 'auth.threads.move',
      method: threadsMove,
      options: { callback: false }
    },
    {
      name: 'auth.threads.purge',
      method: threadsPurge,
      options: { callback: false }
    },
    {
      name: 'auth.threads.vote',
      method: threadsVote,
      options: { callback: false }
    },
    {
      name: 'auth.threads.removeVote',
      method: threadsRemoveVote,
      options: { callback: false }
    },
    {
      name: 'auth.threads.editPoll',
      method: threadsEditPoll,
      options: { callback: false }
    },
    {
      name: 'auth.threads.createPoll',
      method: threadsCreatePoll,
      options: { callback: false }
    },
    {
      name: 'auth.threads.lockPoll',
      method: threadsLockPoll,
      options: { callback: false }
    },
    // -- messages
    {
      name: 'auth.messages.create',
      method: messagesCreate,
      options: { callback: false }
    },
    {
      name: 'auth.messages.delete',
      method: messagesDelete,
      options: { callback: false }
    },
    // -- conversations
    {
      name: 'auth.conversations.create',
      method: conversationsCreate,
      options: { callback: false }
    },
    // -- boards
    {
      name: 'auth.boards.find',
      method: boardsFind,
      options: { callback: false }
    },
    {
      name: 'auth.boards.allCategories',
      method: boardsAllCategories,
      options: { callback: false }
    },
    // -- auth
    {
      name: 'auth.auth.register',
      method: authRegister,
      options: { callback: false }
    },
    // -- admin users
    {
      name: 'auth.admin.users.update',
      method: adminUsersUpdate,
      options: { callback: false }
    },
    {
      name: 'auth.admin.users.addRole',
      method: adminRolesAdd,
      options: { callback: false }
    },
    {
      name: 'auth.admin.users.deleteRole',
      method: adminRolesDelete,
      options: { callback: false }
    },
    {
      name: 'auth.admin.users.ban',
      method: adminUsersBan,
      options: { callback: false }
    },
    {
      name: 'auth.admin.users.banFromBoards',
      method: adminUsersBanFromBoards,
      options: { callback: false }
    },
    // -- admin roles
    {
      name: 'auth.admin.roles.remove',
      method: adminRolesRemove,
      options: { callback: false }
    },
    {
      name: 'auth.admin.roles.validate',
      method: adminRolesValidate,
      options: { callback: false }
    },
    // -- admin reports
    {
      name: 'auth.admin.reports.updateNote',
      method: adminReportsUpdateNote,
      options: { callback: false }
    },
  ];

  // append any new methods to authMethods from options
  var methods = [].concat(options.methods, internalMethods);
  server.method(methods);

  // append the authorization common object to server
  var authorization = {
    common: common,
    stitch: stitch,
    build: build
  };
  server.decorate('server', 'authorization', authorization);

  next();
};

exports.register.attributes = {
  name: 'authorization',
  version: '1.0.0'
};
