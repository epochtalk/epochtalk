var _ = require('lodash');
var Boom = require('boom');
var bcrypt = require('bcrypt');
var Promise = require('bluebird');
var querystring = require('querystring');

var helper = {
  build: build,
  stitch: stitch,
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
  isNotFirstPost: (error, method, args) => {
    return method(...args)
    .then(function(value) {
      if (value.id === args[0]) { return Promise.reject(error); }
      else { return true; }
    });
  },
};

function build(opts) {
  var promise;
  var error = opts.error;

  switch(opts.type) {
    case 'hasPermission':
      promise = helper[opts.type](error, opts.server, opts.auth, opts.permission);
      break;
    case 'isNotFirstPost':
    case 'dbValue':
      promise = helper[opts.type](error, opts.method, opts.args);
      break;
    case 'dbProp':
    case 'dbNotProp':
      promise = helper[opts.type](error, opts.method, opts.args, opts.prop);
      break;
    case 'isMod':
      promise = helper[opts.type](error, opts.method, opts.args, opts.permission);
      break;
    case 'isOwner':
    case 'isUnique':
      promise = helper[opts.type](error, opts.method, opts.args, opts.userId);
      break;
    case 'validatePassword':
      promise = helper[opts.type](error, opts.server, opts.userId, opts.password);
      break;
    case 'isActive':
    case 'isInactive':
      promise = helper[opts.type](error, opts.server, opts.userId);
      break;
    case 'isAccountActive':
      promise = helper[opts.type](error, opts.server, opts.username, opts.userId);
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

  return server.helper.stitch(Boom.notFound(), conditions, 'any');
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

  return server.helper.stitch(Boom.notFound(), conditions, 'any');
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
    requesterActive = server.helper.isActive(Boom.forbidden('Account Not Active'), server, userId);
  }
  else { requesterActive = Promise.reject(Boom.unauthorized()); }
  conditions.push(requesterActive);

  return server.helper.stitch(error, conditions, 'all');
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

  return server.helper.stitch(Boom.notFound(), conditions, 'any');
}

function userDeactivate(server, auth, userId) {
  // -- is User Account Active
  var error = Boom.badRequest('Account Already Inactive');
  var isActive = server.helper.isActive(error, server, userId);

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
  var isInactive = server.helper.isInactive(error, server, userId);

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
  var access = server.helper.stitch(Boom.notFound('Board Not Found'), accessCond, 'any');

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
  var locked = server.helper.stitch(Boom.forbidden('Thread Is Locked'), lockCond, 'any');

  // is requester active
  var active = server.helper.isActive(Boom.forbidden('Account Not Active'), server, userId);

  // final promise
  return Promise.all([access, locked, active]);
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
  var access = server.helper.stitch(error, accessCond, 'any');

  // view deleted
  var deletedSome = server.plugins.acls.getACLValue(auth, 'posts.viewDeleted.some');
  var deletedCond = [
    build({
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.viewDeleted.all'
    }),
    build({
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
  var access = server.helper.stitch(error, accessCond, 'any');

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
  var owner = server.helper.stitch(error, ownerCond, 'any');

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
  var writer = server.helper.stitch(error, writeCond, 'any');

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
  var access = server.helper.stitch(error, accessCond, 'any');

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
  var locked = server.helper.stitch(error, lockedCond, 'any');

  // -- is User Account Active
  var active = server.helper.isActive(Boom.forbidden('Account Not Active'), server, userId);

  // final promise
  return Promise.all([owner, writer, access, locked, active]);
}

function postsDelete(server, auth, postId) {
  var userId = auth.credentials.id;

  // is not first post
  var notFirst = server.helper.build({
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
  var deleted = server.helper.stitch(Boom.forbidden(), deleteCond, 'any');

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
  var access = server.helper.stitch(Boom.notFound(), accessCond, 'any');

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
  var locked = server.helper.stitch(Boom.forbidden(), lockedCond, 'any');

  // is requester active
  var active = server.helper.isActive(Boom.forbidden('Account Not Active'), server, userId);

  return Promise.all([notFirst, deleted, access, locked, active]);
}

function postsPurge(server, auth, postId) {
  var userId = auth.credentials.id;

  // is not first post
  var notFirst = server.helper.build({
    error: Boom.forbidden(),
    type: 'isNotFirstPost',
    method: server.db.posts.getThreadFirstPost,
    args: [postId]
  });

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
  var purge = server.helper.stitch(Boom.forbidden(), purgeCond, 'any');

  return Promise.all([notFirst, purge]);
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
  var access = server.helper.stitch(Boom.notFound(), accessCond, 'any');

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


// -- API

exports.register = function(server, options, next) {
  options = options || {};

  // append any new methods to authMethods from options

  // append the helper Object
  server.decorate('server', 'helper', helper);

  // expose each method as a server method
  // -- watchlist
  server.method('auth.watchThread', watchThread, { callback: false });
  server.method('auth.watchBoard', watchBoard, { callback: false });
  // -- users
  server.method('auth.users.update', userUpdate, { callback: false });
  server.method('auth.users.find', userFind, { callback: false });
  server.method('auth.users.deactivate', userDeactivate, { callback: false });
  server.method('auth.users.activate', userActivate, { callback: false });
  // -- posts
  server.method('auth.posts.create', postsCreate, { callback: false });
  server.method('auth.posts.find', postsFind, { callback: false });
  server.method('auth.posts.byThread', postsByThread, { callback: false });
  server.method('auth.posts.update', postsUpdate, { callback: false });
  server.method('auth.posts.delete', postsDelete, { callback: false });
  server.method('auth.posts.purge', postsPurge, { callback: false });
  server.method('auth.posts.pageByUser', postsPageByUser, { callback: false });

  next();
};

exports.register.attributes = {
  name: 'authorization',
  version: '1.0.0'
};
