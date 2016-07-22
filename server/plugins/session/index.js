var uuid = require('node-uuid');
var jwt = require('jsonwebtoken');
var session = {};
var redis, config, roles;

/**
 * Assumes that the user parameter has
  * id
  * username
  * roles
  * moderating
  * avatar
 */
session.save = function(user) {
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
  // save ban_expiration to redis set under "user:{userId}:baninfo"
  .then(function() {
    var banKey = 'user:' + user.id + ':baninfo';
    var banInfo = {};
    if (user.ban_expiration) { banInfo.expiration = user.ban_expiration; }
    if (user.malicious_score >= 1) {
      banInfo.malicious_score = user.malicious_score;
    }
    return redis.delAsync(banKey)
    .then(function() {
      return Object.keys(banInfo).length ? redis.hmsetAsync(banKey, banInfo) : null;
    });
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

session.updateRoles = function(userId, roles) {
  // pull user role's lookup
  roles = roles || [];
  roles = roles.map(function(role) { return role.lookup; });
  // default to user role
  if (!roles.length) { roles = ['user']; }

  // save roles to redis set under "user:{userId}:roles"
  var roleKey = 'user:' + userId + ':roles';
  return redis.existsAsync(roleKey)
  .then(function(exists) {
    // Delete the key if it exists
    var promise = exists ? redis.delAsync(roleKey) : undefined;

    // Update existing roles
    if (promise) { promise.then(function() { return redis.saddAsync(roleKey, roles); }); }
    // User never had roles add new role to redis
    else { promise = redis.saddAsync(roleKey, roles); }

    return promise;
  });
};

session.updateModerating = function(user) {
  // save moderated board ids to redis set under "user:{userId}:moderating"
  var moderatingKey = 'user:' + user.id + ':moderating';
  return redis.existsAsync(moderatingKey)
  .then(function(exists) {
    // Delete the key if it exists
    var promise = exists ? redis.delAsync(moderatingKey) : undefined;

    // Update existing array for moderating
    if (promise && user.moderating.length) {
      promise.then(function() { return redis.saddAsync(moderatingKey, user.moderating); });
    } // Creating new array for moderating
    else if (user.moderating.length) {
      promise = redis.saddAsync(moderatingKey, user.moderating);
    }

    return promise;
  });
};

session.updateUserInfo = function(user) {
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
      if (exists >= 0 && user.avatar) {
        return redis.hmsetAsync(userKey, { avatar: user.avatar });
      }
      else if (exists > 0 && !user.avatar) {
        return redis.hdelAsync(userKey, 'avatar');
      }
    });
  });
};

session.updateBanInfo = function(userId, banExpiration, maliciousScore) {
  // save ban info to redis hash under "user:{userId}:baninfo"
  var banKey = 'user:' + userId + ':baninfo';
  return redis.hexistsAsync(banKey, 'expiration')
  .then(function(exists) {
    if (exists >= 0 && banExpiration) {
      return redis.hmsetAsync(banKey, { expiration: banExpiration });
    }
    else if (exists > 0 && !banExpiration) {
      return redis.hdelAsync(banKey, 'expiration');
    }
  })
  .then(function() {
    return redis.hexistsAsync(banKey, 'malicious_score')
    .then(function(exists) {
      if (exists >= 0 && maliciousScore) {
        return redis.hmsetAsync(banKey, { malicious_score: maliciousScore });
      }
      else if (exists > 0 && !maliciousScore) {
        return redis.hdelAsync(banKey, 'malicious_score');
      }
    });
  });
};

session.delete = function(sessionId, userId) {
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
    var userSessionKey = 'user:' + userId + ':sessions';
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

session.formatUserReply = formatUserReply;

// private methods

function buildToken(userId, expiration) {
  // build jwt token from decodedToken and privateKey
  var decodedToken = { userId: userId, sessionId: uuid.v4(), timestamp: Date.now() };
  var options = { algorithm: 'HS256', expiresIn: expiration, noTimestamp: true };
  var encodedToken = jwt.sign(decodedToken, config.privateKey, options);
  return { decodedToken: decodedToken, token: encodedToken };
}

function getMaskedPermissions(userRoleNames) {
  var userRoles, mergedRole = {};

  // Banned overrules all other roles
  if (userRoleNames.indexOf(roles.banned.lookup) > -1) { userRoles = [ roles.banned ]; }
  else { userRoles = userRoleNames.map(function(roleName) { return roles[roleName]; }); }
  userRoles.forEach(function(role) { mergedRole = mergeRoles(mergedRole, role); });

  return mergedRole;
}

function mergeRoles(target, source) {
  var sourceKeys = Object.keys(source);

  sourceKeys.map(function(key) {
    // skip id, name, lookup, description, highlightcolor
    if (key === 'id' ||
        key === 'name' ||
        key === 'lookup' ||
        key === 'description') { return; }

    // priorityRestrictions
    if (key === 'priorityRestrictions') {
      if ((target.priority === undefined || target.priority > source.priority) &&
          source.priorityRestrictions &&
          source.priorityRestrictions.length > 0) {
        target.priorityRestrictions = source.priorityRestrictions;
      }
      return;
    }

    // handle priority
    if (key === 'priority' && (target.priority === undefined || target.priority > source.priority)) {
      target.priority = source.priority;
      target.highlight_color = source.highlight_color;
      return;
    }

    // handle permission
    if (typeof source[key] === 'object') {
      target[key] = mergeObjects(target[key], source[key]);
    }
  });

  return target;
}

function mergeObjects(target, source) {
  if (!target) { target = {}; }
  if (!source) { target = source; return target; }

  var sourceKeys = Object.keys(source);

  sourceKeys.map(function(key) {
    if (typeof source[key] === 'boolean' && source[key]) { target[key] = source[key]; }

    if (typeof source[key] === 'object') {
      target[key] = mergeObjects(target[key], source[key]);
    }
  });

  return target;
}

function formatUserReply(token, user) {
  var filteredRoles = [];
  user.roles.forEach(function(roleName) {
    if (roles[roleName]) { filteredRoles.push(roleName); }
  });
  if (!filteredRoles.length) { filteredRoles = ['user']; }
  var reply = {
    token: token,
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    roles: filteredRoles,
    moderating: user.moderating,
    permissions: getMaskedPermissions(filteredRoles),
    ban_expiration: user.ban_expiration,
    malicious_score: user.malicious_score
  };
  return reply;
}

// -- API

exports.register = function(server, options, next) {
  options = options || {};
  if (!options.roles) { return next(new Error('Session: Roles not found in options')); }
  if (!options.redis) { return next(new Error('Session: Redis not found in options')); }
  if (!options.config) { return next(new Error('Session: Config not found in options')); }
  redis = options.redis;
  config = options.config;
  roles = options.roles;

  server.decorate('server', 'session', session);
  server.decorate('request', 'session', session);

  next();
};

exports.register.attributes = {
  name: 'session',
  version: '1.0.0'
};
