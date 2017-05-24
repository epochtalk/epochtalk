var _ = require('lodash');
var Boom = require('boom');
var Promise = require('bluebird');
var querystring = require('querystring');

module.exports = function userUpdate(server, auth, paramsId, payload) {
  var requesterId = auth.credentials.id;

  if (requesterId === paramsId) {
    return sameUser(server, auth, paramsId, payload);
  }
  else {
    return otherUser(server, auth, paramsId, payload);
  }
};

function sameUser(server, auth, paramsId, payload) {
  var allowed = isAllowed(server, auth);
  var active = isActive(server, auth.credentials.id);
  var emailUnique = isEmailUnique(server, paramsId, payload.email);
  var emailPassValid = isPasswordValid(server, paramsId, payload.email_password);
  var usernameUnique = isUsernameUnique(server, paramsId, payload.username);
  var passValid = isPasswordValid(server, paramsId, payload.old_password);
  return Promise.all([allowed, active, emailUnique, emailPassValid, usernameUnique, passValid]);
}

function otherUser(server, auth, paramsId, payload) {
  var allowed = isAllowed(server, auth);
  var active = isActive(server, auth.credentials.id);
  var usernameUnique = isUsernameUnique(server, paramsId, payload.username);
  var noEmail = rejectEmail(payload);
  var noPass = rejectPassword(payload);
  var priority = hasPriority(server, auth, paramsId, auth.credentials.id);
  return Promise.all([allowed, active, usernameUnique, noEmail, noPass, priority]);
}

// check base permission
function isAllowed(server, auth) {
  return server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: server,
    auth: auth,
    permission: 'users.update.allow'
  });
}

// is requester active
function isActive(server, userId) {
  return server.authorization.build({
    error: Boom.forbidden('Account Not Active'),
    type: 'isActive',
    server: server,
    userId: userId
  });
}

// new email unique
function isEmailUnique(server, userId, email) {
  if (email) {
    return server.authorization.build({
      error: Boom.badRequest(),
      type: 'isUnique',
      method: server.db.users.userByEmail,
      args: [email],
      userId: userId
    });
  }
  else { return true; }
}

// new username unique
function isUsernameUnique(server, userId, username) {
  if (username) {
    return server.authorization.build({
      error: Boom.badRequest(),
      type: 'isUnique',
      method: server.db.users.userByUsername,
      args: [querystring.unescape(username)],
      userId: userId
    });
  }
  else { return true; }
}

// old password valid
function isPasswordValid(server, userId, password) {
  if (password) {
    return server.authorization.build({
      error: Boom.badRequest(),
      type: 'validatePassword',
      server: server,
      userId: userId,
      password: password
    });
  }
  else { return true; }
}

// remove email from payload for other users
function rejectEmail(payload) {
  if (payload.email) {
    var error = Boom.badRequest('Not Allowed to change other user\'s email');
    return Promise.reject(error);
  }
  else { return true; }
}

// reject passwords change attempts for other users
function rejectPassword(payload) {
  if (payload.old_password) {
    var error = Boom.badRequest('Not Allowed to change other user\'s password');
    return Promise.reject(error);
  }
  else { return true; }
}

// priority
function hasPriority(server, auth, paramsId, authedId) {
  var same = server.plugins.acls.getACLValue(auth, 'users.update.bypass.priority.admin');
  var lower = server.plugins.acls.getACLValue(auth, 'users.update.bypass.priority.mod');

  // get referenced user's priority
  var paramPriority = server.db.users.find(paramsId)
  .then(function(paramUser) { return _.min(_.map(paramUser.roles, 'priority')); })
  .error(() => { return Promise.reject(Boom.badRequest()); });

  // get authed user's priority
  var authedPriority = server.db.users.find(authedId)
  .then(function(authUser) { return _.min(_.map(authUser.roles, 'priority')); })
  .error(() => { return Promise.reject(Boom.badRequest()); });

  return Promise.join(paramPriority, authedPriority, function(pid, aid) {
    // current has same or higher priority than referenced
    if (same && aid <= pid) { return true; }
    // current has higher priority than referenced
    else if (lower && aid < pid) { return true; }
    else { return Promise.reject(Boom.badRequest()); }
  });
}
