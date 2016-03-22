var Boom = require('boom');
var Promise = require('bluebird');

/**
 * JWT
 * decodedToken, the decrypted value in the token
 *   -- { username, user_id, email }
 * token, the encrypted token value
 * cb(err, isValid, credentials),
 *   -- isValid, if true if decodedToken matches a user token
 *   -- credentials, the user short object to be tied to request.auth.credentials
 */
module.exports = function(decodedToken, token, redis, cb) {
  var userInfo, userRoles, banInfo, userModerating;
  var userId = decodedToken.userId;
  var sessionId = decodedToken.sessionId;
  // get session information
  var sessionKey = 'user:' + userId + ':session:' + sessionId;
  return redis.getAsync(sessionKey)
  // validate session
  .then(function(timestamp) {
    if (!timestamp) { return Promise.reject(); }
    timestamp = Number(timestamp);
    if (timestamp !== decodedToken.timestamp) { return Promise.reject(); }
  })
  // get user information
  .then(function() {
    var userKey = 'user:' + userId;
    return redis.hgetallAsync(userKey)
    .then(function(value) { userInfo = value; });
  })
  // get user roles
  .then(function() {
    var userRoleKey = 'user:' + userId + ':roles';
    return redis.smembersAsync(userRoleKey)
    .then(function(value) { userRoles = value || []; });
  })
  // get user ban info
  .then(function() {
    var userBanKey = 'user:' + userId + ':baninfo';
    return redis.hgetallAsync(userBanKey)
    .then(function(value) { banInfo = value; });
  })
  // get user moderating boards
  .then(function() {
    var userModeratingKey = 'user:' + userId + ':moderating';
    return redis.smembersAsync(userModeratingKey)
    .then(function(value) { userModerating = value || []; });
  })
  .then(function() {
    // build credentials
    var credentials = {
      token: token,
      id: userId,
      sessionId: sessionId,
      username: userInfo.username,
      avatar: userInfo.avatar,
      roles: userRoles,
      moderating: userModerating,
      ban_expiration: banInfo && banInfo.expiration ? new Date(banInfo.expiration) : undefined
    };
    return cb(null, true, credentials);
  })
  .catch(function() {
    var error = Boom.unauthorized('Session is no longer valid.');
    return cb(error, false, {});
  });
};
