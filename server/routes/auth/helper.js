var helper = {};
module.exports = helper;
var _ = require('lodash');
var path = require('path');
var uuid = require('node-uuid');
var jwt = require('jsonwebtoken');
var redis = require(path.normalize(__dirname + '/../../../redis'));
var config = require(path.normalize(__dirname + '/../../../config'));
var roles = require(path.normalize(__dirname + '/../../plugins/acls/roles'));

// TODO: handle token expiration?
function buildToken(userId) {
  // build jwt token from decodedToken and privateKey
  var decodedToken = { userId: userId, sessionId: uuid.v4(), timestamp: Date.now() };
  var encodedToken = jwt.sign(decodedToken, config.privateKey, { algorithm: 'HS256' });
  return { decodedToken: decodedToken, token: encodedToken };
}

function getMaskedPermissions(userRoles) {
  var permissions = userRoles.map(function(roleName) { return roles[roleName]; });

  var maskPermission = function(permissionName) {
    var allPermissions = permissions.map(function(acl) { return _.get(acl, permissionName); });
    var maskedPermission = false;
    allPermissions.forEach(function(val) { maskedPermission = val || maskedPermission; });
    return maskedPermission;
  };

  return {
    adminAccess: maskPermission('adminAccess') ? {
      settings: maskPermission('adminAccess.settings') ? {
        general: maskPermission('adminAccess.settings.general'),
        forum: maskPermission('adminAccess.settings.forum')
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
      messages: maskPermission('modAccess.messages')
    } : undefined,
    profileControls: maskPermission('adminUsers') ? {
      viewUserEmail: maskPermission('adminUsers.find')
    } : undefined,
    threadControls: {

    },
    postControls: {

    }
  };
}

function formatUserReply(token, user) {
  return {
    token: token,
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    roles: user.roles,
    moderating: user.moderating,
    permissions: getMaskedPermissions(user.roles)
  };
}

helper.saveSession = function(user) {
  // build Token
  var tokenResult = buildToken(user.id);
  var decodedToken = tokenResult.decodedToken;
  var token = tokenResult.token;
  user.roles = user.roles.map(function(role) { return role.lookup; });

  // save username, avatar to redis hash under "user:{userId}"
  var userKey = 'user:' + user.id;
  var userValue = { username: user.username };
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
    .then(function() { return redis.saddAsync(moderatingKey, user.moderating); });
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

helper.updateRoles = function(user) {
  // pull user role's lookup
  user.roles = user.roles.map(function(role) { return role.lookup; });

  // save roles to redis set under "user:{userId}:roles"
  var roleKey = 'user:' + user.id + ':roles';
  return redis.existsAsync(roleKey)
  .then(function(exists) {
    if (exists > 0) {
      return redis.delAsync(roleKey)
      .then(function() { return redis.saddAsync(roleKey, user.roles); });
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
