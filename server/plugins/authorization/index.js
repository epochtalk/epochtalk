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

// -- POSTS

function postsCreate(server, auth, threadId) {
  var userId = auth.credentials.id;

  // Access to board with thread id
  var priority = server.plugins.acls.getUserPriority(auth);
  var some = server.plugins.acls.getACLValue(auth, 'boards.viewUncategorized.some');
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
  var access = server.authorization.stitch(Boom.notFound('Board Not Found'), accessCond, 'any');

  // user is not banned from this board
  var notBannedFromBoard = server.authorization.common.isNotBannedFromBoard(Boom.forbidden('You are banned from this board'), server, userId, { threadId: threadId });

  // Access to locked thread with thread id
  var tlSome = server.plugins.acls.getACLValue(auth, 'posts.bypassLock.some');
  var lockCond = [
    {
      // Permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.bypassLock.all'
    },
    {
      // thread not locked
      type: 'dbNotProp',
      method: server.db.threads.find,
      args: [threadId],
      prop: 'locked'
    },
    {
      // is user a board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithThreadId,
      args: [userId, threadId],
      permission: tlSome
    }
  ];
  var locked = server.authorization.stitch(Boom.forbidden('Thread Is Locked'), lockCond, 'any');

  // is requester active
  var active = server.authorization.common.isActive(Boom.forbidden('Account Not Active'), server, userId);

  // final promise
  return Promise.all([access, notBannedFromBoard, locked, active]);
}

function postsFind(server, auth, postId) {
  // try mode on: must check user is authed
  var userId = '';
  var authenticated = auth.isAuthenticated;
  if (authenticated) { userId = auth.credentials.id; }
  var error = Boom.notFound();

  // access board
  var accessSome = server.plugins.acls.getACLValue(auth, 'boards.viewUncategorized.some');
  var priority = server.plugins.acls.getUserPriority(auth);
  var accessCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'boards.viewUncategorized.all'
    },
    {
      // is board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithPostId,
      args: [userId, postId],
      permission: accessSome
    },
    {
      // is board visible
      type: 'dbValue',
      method: server.db.posts.getPostsBoardInBoardMapping,
      args: [postId, priority]
    }
  ];
  var access = server.authorization.stitch(error, accessCond, 'any');

  // view deleted
  var deletedSome = server.plugins.acls.getACLValue(auth, 'posts.viewDeleted.some');
  var deletedCond = [
    server.authorization.build({
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.viewDeleted.all'
    }),
    server.authorization.build({
      // is board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithPostId,
      args:[userId, postId],
      permission: deletedSome
    })
  ];

  var deleted = Promise.any(deletedCond)
  .then(() => { return true; })
  .catch(() => { return false; });

  // final promise
  return Promise.all([access, deleted])
  .then((dataArr) => { return dataArr[1]; });
}

function postsByThread(server, auth, threadId) {
  // try mode on
  var userId = '';
  var authenticated = auth.isAuthenticated;
  if (authenticated) { userId = auth.credentials.id; }
  var error = Boom.notFound();

  // access board
  var some = server.plugins.acls.getACLValue(auth, 'boards.viewUncategorized.some');
  var priority = server.plugins.acls.getUserPriority(auth);
  var accessCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'boards.viewUncategorized.all'
    },
    {
      // is board visible
      type: 'dbValue',
      method: server.db.threads.getThreadsBoardInBoardMapping,
      args: [threadId, priority]
    },
    {
      // is board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithThreadId,
      args: [userId, threadId],
      permission: some
    }
  ];
  var access = server.authorization.stitch(error, accessCond, 'any');

  // view deleted
  var viewAll = server.plugins.acls.getACLValue(auth, 'posts.viewDeleted.all');
  var viewSome = server.plugins.acls.getACLValue(auth, 'posts.viewDeleted.some');
  var viewDeleted = server.db.moderators.getUsersBoards(userId)
  .then(function(boards) {
    var result = false;
    if (viewAll) { result = true; }
    else if (viewSome && boards.length > 0) { result = boards; }
    return result;
  });

  return Promise.all([access, viewDeleted])
  .then((data) => { return data[1]; });
}

function postsUpdate(server, auth, postId, threadId) {
  var userId = auth.credentials.id;
  var error = Boom.forbidden();

  // is post owner
  var ownerCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.privilegedUpdate.all'
    },
    {
      // is post owner
      type: 'isOwner',
      method: server.db.posts.find,
      args: [postId],
      userId: userId
    },
    {
      // is board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithPostId,
      args: [userId, postId],
      permission: server.plugins.acls.getACLValue(auth, 'posts.privilegedUpdate.some')
    }
  ];
  var owner = server.authorization.stitch(error, ownerCond, 'any');

  // can write to post
  var writeCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.privilegedUpdate.all'
    },
    {
      // is post not deleted
      type: 'dbNotProp',
      method: server.db.posts.find,
      args: [postId],
      prop: 'deleted'
    },
    {
      // is board moderator
      type: 'isMod',
      method:  server.db.moderators.isModeratorWithPostId,
      args: [userId, postId],
      permission: server.plugins.acls.getACLValue(auth, 'posts.privilegedUpdate.some')
    }
  ];
  var writer = server.authorization.stitch(error, writeCond, 'any');

  // access board
  var accessCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'boards.viewUncategorized.all'
    },
    {
      // is board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithPostId,
      args: [userId, postId],
      permission: server.plugins.acls.getACLValue(auth, 'boards.viewUncategorized.some')
    },
    {
      // is board visible
      type: 'dbValue',
      method: server.db.posts.getPostsBoardInBoardMapping,
      args: [postId, server.plugins.acls.getUserPriority(auth)]
    }
  ];
  var access = server.authorization.stitch(error, accessCond, 'any');

  // user is not banned from this board
  var notBannedFromBoard = server.authorization.common.isNotBannedFromBoard(Boom.forbidden('You are banned from this board'), server, userId, { threadId: threadId });

  // is thread locked
  var lockedCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.bypassLock.all'
    },
    {
      // is thread locked
      type: 'dbNotProp',
      method: server.db.threads.find,
      args: [threadId],
      prop: 'locked'
    },
    {
      // is board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithThreadId,
      args: [userId, threadId],
      permission: server.plugins.acls.getACLValue(auth, 'posts.bypassLock.some')
    }
  ];
  var locked = server.authorization.stitch(error, lockedCond, 'any');

  // -- is User Account Active
  var active = server.authorization.common.isActive(Boom.forbidden('Account Not Active'), server, userId);

  // final promise
  return Promise.all([owner, writer, access, notBannedFromBoard, locked, active]);
}

function postsDelete(server, auth, postId) {
  var userId = auth.credentials.id;

  // is not first post
  var notFirst = server.authorization.build({
    error: Boom.forbidden(),
    type: 'isNotFirstPost',
    method: server.db.posts.getThreadFirstPost,
    args: [postId]
  });

  // is post alright to delete
  var hasSMPrivilege = server.plugins.acls.getACLValue(auth, 'threads.moderated');
  var isThreadModerated = server.db.posts.isPostsThreadModerated(postId);
  var isThreadOwner = server.db.posts.isPostsThreadOwner(postId, userId);
  var deleteCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.privilegedDelete.all'
    },
    {
      // is post owner
      type: 'isOwner',
      method: server.db.posts.find,
      args: [postId],
      userId: userId
    },
    {
      // is board mod
      type: 'isMod',
      method: server.db.moderators.isModeratorWithPostId,
      args: [userId, postId],
      permission: server.plugins.acls.getACLValue(auth, 'posts.privilegedDelete.some')
    },
    Promise.join(isThreadModerated, isThreadOwner, hasSMPrivilege, function(threadSM, owner, userSM) {
      if (threadSM && owner && userSM) { return true; }
      else { return Promise.reject(Boom.forbidden()); }
    })
  ];
  var deleted = server.authorization.stitch(Boom.forbidden(), deleteCond, 'any');

  // access board with post id
  var accessCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'boards.viewUncategorized.all'
    },
    {
      // is board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithPostId,
      args: [userId, postId],
      permission: server.plugins.acls.getACLValue(auth, 'boards.viewUncategorized.some')
    },
    {
      // is board visible
      type: 'dbValue',
      method: server.db.posts.getPostsBoardInBoardMapping,
      args: [postId, server.plugins.acls.getUserPriority(auth)]
    }
  ];
  var access = server.authorization.stitch(Boom.notFound(), accessCond, 'any');

  // user is not banned from this board
  var notBannedFromBoard = server.authorization.common.isNotBannedFromBoard(Boom.forbidden('You are banned from this board'), server, userId, { postId: postId });

  // is thread locked
  var lockedCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.bypassLock.all'
    },
    {
      // is thread locked
      type: 'dbNotProp',
      method: server.db.posts.getPostsThread,
      args: [postId],
      prop: 'locked'
    },
    {
      // is board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithPostId,
      args: [userId, postId],
      permission: server.plugins.acls.getACLValue(auth, 'posts.bypassLock.some')
    }
  ];
  var locked = server.authorization.stitch(Boom.forbidden(), lockedCond, 'any');

  // is requester active
  var active = server.authorization.common.isActive(Boom.forbidden('Account Not Active'), server, userId);

  return Promise.all([notFirst, deleted, access, notBannedFromBoard, locked, active]);
}

function postsPurge(server, auth, postId) {
  var userId = auth.credentials.id;

  // is not first post
  var notFirst = server.authorization.build({
    error: Boom.forbidden(),
    type: 'isNotFirstPost',
    method: server.db.posts.getThreadFirstPost,
    args: [postId]
  });

  // user is not banned from this board
  var notBannedFromBoard = server.authorization.common.isNotBannedFromBoard(Boom.forbidden('You are banned from this board'), server, userId, { postId: postId });

  var purgeCond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.privilegedPurge.all'
    },
    {
      // is board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithPostId,
      args: [userId, postId],
      permission: server.plugins.acls.getACLValue(auth, 'posts.privilegedPurge.some')
    }
  ];
  var purge = server.authorization.stitch(Boom.forbidden(), purgeCond, 'any');

  return Promise.all([notFirst, notBannedFromBoard, purge]);
}

function postsPageByUser(server, auth, username) {
  // try mode on: must check user is authed

  var userId;
  if (auth.isAuthenticated) { userId = auth.credentials.id; }

  // access user
  var accessCond = [
    {
      // is the user account we're looking for active
      type: 'isAccountActive',
      server: server,
      username: querystring.unescape(username),
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
  var access = server.authorization.stitch(Boom.notFound(), accessCond, 'any');

  // user priority
  var priority = server.plugins.acls.getUserPriority(auth);

  // view deleted profile posts
  var viewAll = server.plugins.acls.getACLValue(auth, 'posts.viewDeleted.all');
  var viewSome = server.plugins.acls.getACLValue(auth, 'posts.viewDeleted.some');
  var deleted = server.db.moderators.getUsersBoards(userId)
  .then(function(boards) {
    var result = false;
    if (viewAll) { result = true; }
    else if (viewSome && boards.length > 0) { result = boards; }
    return result;
  });

  return Promise.all([access, priority, deleted])
  .then((data) => { return { priority: data[1], viewables: data[2] }; });
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
  // get role were trying to ad users to
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
    // -- posts
    {
      name: 'auth.posts.create',
      method: postsCreate,
      options: { callback: false }
    },
    {
      name: 'auth.posts.find',
      method: postsFind,
      options: { callback: false }
    },
    {
      name: 'auth.posts.byThread',
      method: postsByThread,
      options: { callback: false }
    },
    {
      name: 'auth.posts.update',
      method: postsUpdate,
      options: { callback: false }
    },
    {
      name: 'auth.posts.delete',
      method: postsDelete,
      options: { callback: false }
    },
    {
      name: 'auth.posts.purge',
      method: postsPurge,
      options: { callback: false }
    },
    {
      name: 'auth.posts.pageByUser',
      method: postsPageByUser,
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
    // -- admin roles
    {
      name: 'auth.admin.roles.remove',
      method: adminRolesRemove,
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
