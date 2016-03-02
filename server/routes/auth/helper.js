var helper = {};
module.exports = helper;
var _ = require('lodash');
var path = require('path');
var uuid = require('node-uuid');
var jwt = require('jsonwebtoken');
var redis = require(path.normalize(__dirname + '/../../../redis'));
var config = require(path.normalize(__dirname + '/../../../config'));
var roles = require(path.normalize(__dirname + '/../../plugins/acls/roles'));

function buildToken(userId, expiration) {
  // build jwt token from decodedToken and privateKey
  var decodedToken = { userId: userId, sessionId: uuid.v4(), timestamp: Date.now() };
  var options = { algorithm: 'HS256', expiresIn: expiration, noTimestamp: true };
  var encodedToken = jwt.sign(decodedToken, config.privateKey, options);
  return { decodedToken: decodedToken, token: encodedToken };
}

function getMaskedPermissions(userRoles) {
  var permissions;

  // Banned overrules all other roles
  if (userRoles.indexOf(roles.banned.lookup) > -1) { permissions = [ roles.banned ]; }
  else { permissions = userRoles.map(function(roleName) { return roles[roleName]; }); }

  var maskPermission = function(permissionName) {
    var allPermissions = permissions.map(function(acl) { return _.get(acl, permissionName); });
    var maskedPermission = false;
    allPermissions.forEach(function(val) { maskedPermission = val || maskedPermission; });
    return maskedPermission;
  };

  var getPriority = function() {
    var priority = _.min(permissions.map(function(role) { return role ? role.priority : Number.MAX_VALUE; }));
    if (priority > -1) { return priority; }
    else { return Number.MAX_VALUE; }
  };

  return {
    priority: getPriority(),
    priorityRestrictions: maskPermission('priorityRestrictions') || undefined,
    adminAccess: maskPermission('adminAccess') ? {
      settings: maskPermission('adminAccess.settings') ? {
        general: maskPermission('adminAccess.settings.general'),
        advanced: maskPermission('adminAccess.settings.advanced'),
        theme: maskPermission('adminAccess.settings.theme')
      } : undefined,
      management: maskPermission('adminAccess.management') ? {
        boards: maskPermission('adminAccess.management.boards'),
        users: maskPermission('adminAccess.management.users'),
        roles: maskPermission('adminAccess.management.roles')
      } : undefined
    } : undefined,
    modAccess: maskPermission('modAccess') ? {
      users: maskPermission('modAccess.users'),
      posts: maskPermission('modAccess.posts'),
      messages: maskPermission('modAccess.messages'),
      boardBans: maskPermission('modAccess.boardBans'),
      logs: maskPermission('modAccess.logs')
    } : undefined,
    profileControls: maskPermission('adminUsers') || maskPermission('users.privilegedDeactive') || maskPermission('users.privilegedReactivate') || maskPermission('users.deactivate') || maskPermission('users.reactivate') ? {
      viewUserEmail: maskPermission('adminUsers.find'),
      deactivate: maskPermission('users.deactivate'),
      reactivate: maskPermission('users.reactivate'),
      privilegedUpdate: maskPermission('adminUsers.privilegedUpdate') ? {
        samePriority: maskPermission('adminUsers.privilegedUpdate.samePriority'),
        lowerPriority: maskPermission('adminUsers.privilegedUpdate.lowerPriority')
      } : undefined,
      privilegedBan: maskPermission('adminUsers.privilegedBan') ? {
        samePriority: maskPermission('adminUsers.privilegedBan.samePriority'),
        lowerPriority: maskPermission('adminUsers.privilegedBan.lowerPriority')
      } : undefined,
      privilegedDeactivate: maskPermission('users.privilegedDeactivate') ? {
        samePriority: maskPermission('users.privilegedDeactivate.samePriority'),
        lowerPriority: maskPermission('users.privilegedDeactivate.lowerPriority')
      } : undefined,
      privilegedReactivate: maskPermission('users.privilegedReactivate') ? {
        samePriority: maskPermission('users.privilegedReactivate.samePriority'),
        lowerPriority: maskPermission('users.privilegedReactivate.lowerPriority')
      } : undefined,
      privilegedDelete: maskPermission('users.privilegedDelete') ? {
        samePriority: maskPermission('users.privilegedDelete.samePriority'),
        lowerPriority: maskPermission('users.privilegedDelete.lowerPriority')
      } : undefined
    } : undefined,
    threadControls: {
      privilegedTitle: maskPermission('threads.privilegedTitle') ? {
        some: maskPermission('threads.privilegedTitle.some'),
        all: maskPermission('threads.privilegedTitle.all')
      } : undefined,
      privilegedLock: maskPermission('threads.privilegedLock') ? {
        some: maskPermission('threads.privilegedLock.some'),
        all: maskPermission('threads.privilegedLock.all')
      } : undefined,
      privilegedSticky: maskPermission('threads.privilegedSticky') ? {
        some: maskPermission('threads.privilegedSticky.some'),
        all: maskPermission('threads.privilegedSticky.all')
      } : undefined,
      privilegedMove: maskPermission('threads.privilegedMove') ? {
        some: maskPermission('threads.privilegedMove.some'),
        all: maskPermission('threads.privilegedMove.all')
      } : undefined,
      privilegedPurge: maskPermission('threads.privilegedPurge') ? {
        some: maskPermission('threads.privilegedPurge.some'),
        all: maskPermission('threads.privilegedPurge.all')
      } : undefined,
      create: maskPermission('threads.create'),
      title: maskPermission('threads.title'),
      lock: maskPermission('threads.lock'),
      moderated: maskPermission('threads.moderated')
    },
    pollControls: {
      privilegedLock: maskPermission('polls.privilegedLock') ? {
        some: maskPermission('polls.privilegedLock.some'),
        all: maskPermission('polls.privilegedLock.all')
      } : undefined,
      create: maskPermission('polls.create'),
      vote: maskPermission('polls.vote'),
      lock: maskPermission('polls.lock')
    },
    postControls: {
      privilegedUpdate: maskPermission('posts.privilegedUpdate') ? {
        some: maskPermission('posts.privilegedUpdate.some'),
        all: maskPermission('posts.privilegedUpdate.all')
      } : undefined,
      privilegedDelete: maskPermission('posts.privilegedDelete') ? {
        some: maskPermission('posts.privilegedDelete.some'),
        all: maskPermission('posts.privilegedDelete.all')
      } : undefined,
      privilegedPurge: maskPermission('posts.privilegedPurge') ? {
        some: maskPermission('posts.privilegedPurge.some'),
        all: maskPermission('posts.privilegedPurge.all')
      } : undefined,
      bypassLock: maskPermission('posts.bypassLock') ? {
        some: maskPermission('posts.bypassLock.some'),
        all: maskPermission('posts.bypassLock.all')
      } : undefined,
      create: maskPermission('posts.create'),
      update: maskPermission('posts.update'),
      delete: maskPermission('posts.delete'),
      undelete: maskPermission('posts.undelete')
    },
    userControls: {
      privilegedBanFromBoards: maskPermission('adminUsers.privilegedBanFromBoards') ? {
        some: maskPermission('adminUsers.privilegedBanFromBoards.some'),
        all: maskPermission('adminUsers.privilegedBanFromBoards.all')
      } : undefined,
    },
    roleControls: maskPermission('adminRoles') ? {
      privilegedAddRoles: maskPermission('adminUsers.privilegedAddRoles') ? {
        samePriority: maskPermission('adminUsers.privilegedAddRoles.samePriority'),
        lowerPriority: maskPermission('adminUsers.privilegedAddRoles.lowerPriority')
      } : undefined,
      privilegedRemoveRoles: maskPermission('adminUsers.privilegedRemoveRoles') ? {
        samePriority: maskPermission('adminUsers.privilegedRemoveRoles.samePriority'),
        lowerPriority: maskPermission('adminUsers.privilegedRemoveRoles.lowerPriority')
      } : undefined,
      all: maskPermission('adminRoles.all'),
      users: maskPermission('adminRoles.users'),
      add: maskPermission('adminRoles.add'),
      remove: maskPermission('adminRoles.remove'),
      update: maskPermission('adminRoles.update'),
      reprioritize: maskPermission('adminRoles.reprioritize')
    } : undefined,
    messageControls: {
      createConversations: maskPermission('conversations.create'),
      createMessages: maskPermission('messages.create'),
      deleteMessages: maskPermission('messages.delete'),
      privilegedDelete: maskPermission('messages.privilegedDelete')
    },
    reportControls: {
      reportPosts: maskPermission('reports.createPostReport'),
      reportUsers: maskPermission('reports.createUserReport'),
      reportMessages: maskPermission('reports.createMessageReport'),
      updateUserReport: maskPermission('adminReports.updateUserReport') || undefined,
      updatePostReport: maskPermission('adminReports.updatePostReport') || undefined,
      updateMessageReport: maskPermission('adminReports.updateMessageReport') || undefined,
      createUserReportNote: maskPermission('adminReports.createUserReportNote') || undefined,
      createPostReportNote: maskPermission('adminReports.createPostReportNote') || undefined,
      createMessageReportNote: maskPermission('adminReports.createMessageReportNote') || undefined,
      updateUserReportNote: maskPermission('adminReports.updateUserReportNote') || undefined,
      updatePostReportNote: maskPermission('adminReports.updatePostReportNote') || undefined,
      updateMessageReportNote: maskPermission('adminReports.updateMessageReportNote') || undefined
    }
  };
}

function formatUserReply(token, user) {
  var filteredRoles = [];
  user.roles.forEach(function(roleName) {
    if(roles[roleName]) { filteredRoles.push(roleName); }
  });
  if (!filteredRoles.length) { filteredRoles = ['user']; }
  return {
    token: token,
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    roles: filteredRoles,
    moderating: user.moderating,
    permissions: getMaskedPermissions(filteredRoles),
    ban_expiration: user.ban_expiration
  };
}

/**
 * Assumes that the user parameter has
  * id
  * username
  * roles
  * moderating
  * avatar
 */
helper.saveSession = function(user) {
  // build Token
  var tokenResult = buildToken(user.id, user.expiration);
  var decodedToken = tokenResult.decodedToken;
  var token = tokenResult.token;
  user.roles = user.roles.map(function(role) { return role.lookup; });
  // default to user role
  if (!user.roles.length) { user.roles = ['user']; }

  // save username, avatar to redis hash under "user:{userId}"
  var userKey = 'user:' + user.id;
  var userValue = { username: user.username};
  if (user.avatar) { userValue.avatar = user.avatar; }
  return redis.hmsetAsync(userKey, userValue)
  // save roles to redis set under "user:{userId}:roles"
  .then(function() {
    var roleKey = 'user:' + user.id + ':roles';
    return redis.delAsync(roleKey)
    .then(function() { return redis.saddAsync(roleKey, user.roles); });
  })
  // save moderting boards to redis set under "user:{userId}:moderating"
  .then(function() {
    var moderatingKey = 'user:' + user.id + ':moderating';
    return redis.delAsync(moderatingKey)
    .then(function() {
      if (user.moderating && user.moderating.length) {
        return redis.saddAsync(moderatingKey, user.moderating);
      }
    });
  })
  // save session to redis key under "user:{userId}:session:{sessionId}"
  .then(function() {
    var sessionKey = 'user:' + user.id + ':session:' + decodedToken.sessionId;
    return redis.setAsync(sessionKey, decodedToken.timestamp);
  })
  // save user-session to redis set under "user:{userId}:sessions"
  .then(function() {
    var userSessionKey = 'user:' + user.id + ':sessions';
    return redis.saddAsync(userSessionKey, decodedToken.sessionId);
  })
  .then(function() { return formatUserReply(token, user); });
};

helper.updateRoles = function(userId, roles) {
  // pull user role's lookup
  roles = roles || [];
  roles = roles.map(function(role) { return role.lookup; });
  // default to user role
  if (!roles.length) { roles = ['user']; }

  // save roles to redis set under "user:{userId}:roles"
  var roleKey = 'user:' + userId + ':roles';
  return redis.existsAsync(roleKey)
  .then(function(exists) {
    if (exists > 0) {
      return redis.delAsync(roleKey)
      .then(function() { return redis.saddAsync(roleKey, roles); });
    }
  });
};

helper.updateModerating = function(user) {
  // save roles to redis set under "user:{userId}:roles"
  var moderatingKey = 'user:' + user.id + ':moderating';
  return redis.existsAsync(moderatingKey)
  .then(function(exists) {
    if (exists > 0) {
      return redis.delAsync(moderatingKey)
      .then(function() { return redis.saddAsync(moderatingKey, user.moderating); });
    }
  });
};

helper.updateUserInfo = function(user) {
  // save username, avatar to redis hash under "user:{userId}"
  var userKey = 'user:' + user.id;
  // check username for update
  return redis.hexistsAsync(userKey, 'username')
  .then(function(exists) {
    if (exists > 0) {
      return redis.hmsetAsync(userKey, { username: user.username });
    }
  })
  // check avatar for update
  .then(function() {
    return redis.hexistsAsync(userKey, 'avatar')
    .then(function(exists) {
      if (exists > 0 && user.avatar) {
        return redis.hmsetAsync(userKey, { avatar: user.avatar });
      }
      else if (exists === 0 && user.avatar) {
        return redis.hmsetAsync(userKey, { avatar: user.avatar });
      }
      else if (exists > 0 && !user.avatar) {
        return redis.hdelAsync(userKey, 'avatar');
      }
    });
  });
};

helper.deleteSession = function(sessionId, userId) {
  // delete session with key "user:{userId}:session:{sessionId}"
  var sessionKey = 'user:' + userId + ':session:' + sessionId;
  return redis.delAsync(sessionKey)
  // delete session from user with key "user:{userId}:sessions"
  .then(function() {
    var userSessionKey = 'user:' + userId + ':sessions';
    return redis.sremAsync(userSessionKey, sessionId);
  })
  // delete user data if no more sessions
  .then(function() {
    // get user-session listing
    var userSessionKey = 'users:' + userId + ':sessions';
    return redis.smembersAsync(userSessionKey)
    .then(function(setMembers) {
      // no more sessions
      if (setMembers.length < 1) {
        // delete user-sessions set
        return redis.delAsync(userSessionKey)
        // delete user roles
        .then(function() {
          var roleKey = 'user:' + userId + ':roles';
          return redis.delAsync(roleKey);
        })
        // delete user moderating boards
        .then(function() {
          var moderatingKey = 'user:' + userId + ':moderating';
          return redis.delAsync(moderatingKey);
        })
        // delte user info
        .then(function() {
          var userKey = 'user:' + userId;
          return redis.delAsync(userKey);
        });
      }
    });
  });
};

helper.formatUserReply = formatUserReply;
