var path = require('path');
var Boom = require('boom');
var bcrypt = require('bcrypt');
var Promise = require('bluebird');
var db = require(path.normalize(__dirname + '/../../../db'));

module.exports = {
  canUpdate: function(request, reply) {
    var userId = request.auth.credentials.id;
    var username = request.payload.username;
    var email = request.payload.email;
    var oldPassword = request.payload.old_password;

    var isPasswordValid = isOldPasswordValid(oldPassword, userId);
    var isUsernameUnique = isNewUsernameUnique(username, userId);
    var isEmailUnique = isNewEmailUnique(email, userId);

    var promise = Promise.join(isPasswordValid, isUsernameUnique, isEmailUnique, function(password, username, email) {
      var results = Boom.forbidden();

      if (!password) { results = Boom.badRequest('Invalid Password'); }
      else if (!username) { result = Boom.badRequest('Username Taken'); }
      else if (!email) { result = Boom.badRequest('Email Taken'); }
      else { results = ''; }

      return results;
    });

    return reply(promise);
  },
  canDeactivate: function(request, reply) {
    var userId = request.auth.credentials.id;
    var promise = isUserActive(userId)
    .then(function(active) {
      var results = Boom.forbidden();
      if (active) { results = ''; }
      else { result = Boom.badRequest('Account is Not Active'); }
      return results;
    });
    return reply(promise);
  },
  canReactivate: function(request, reply) {
    var userId = request.auth.credentials.id;
    var promise = isUserActive(userId)
    .then(function(active) {
      var results = Boom.forbidden();
      if (active) { results = Boom.badRequest('Account is Active'); }
      else { results = ''; }
      return results;
    });
    return reply(promise);
  },
  canDelete: function(request, reply) {
    var username = request.auth.credentials.username;
    var authenticated = request.auth.isAuthenticated;
    var promise = commonPre.isAdmin(authenticated, username)
    .then(function(admin) {
      var result = Boom.forbidden();
      if (admin) { result = ''; }
      return result;
    });
    return reply(promise);
  }
};

/* Should check if the user's account is active or not */
function isUserActive(userId) {
  return db.users.find(userId)
  .then(function(user) {
    var active = false;
    if (user) { active = user.deleted; }
    return active;
  });
}

/* Should check if the old_password given matches this user's password */
function isOldPasswordValid(oldPassword, userId) {
  var valid = false;

  if (!oldPassword) { return Promise.resolve(true); }

  return db.users.find(userId)
  .then(function(user) {
    if (bcrypt.compareSync(oldPassword, user.passhash)) { valid = true; }
    return valid;
  });
}

/* Should check if email exists, is different from user's current email, and is unique */
function isNewUsernameUnique(username, userId) {
  var unique = false;

  // bypass check if no email given
  if (!username) { return Promise.resolve(true); }

  // check if user exists with this email
  return db.users.userByUsername(username)
  .then(function(user) {
    // email hasn't changed
    if (user && user.id === userId) { unique = true; }
    // user with this email already exists and is not this user
    else if (user) { unique = false; }
    // no user with this email
    else { unique = true; }
    return unique;
  });
}

/* Should check if email exists, is different from user's current email, and is unique */
function isNewEmailUnique(email, userId) {
  var unique = false;

  // bypass check if no email given
  if (!email) { return Promise.resolve(true); }

  // check if user exists with this email
  return db.users.userByEmail(email)
  .then(function(user) {
    // email hasn't changed
    if (user && user.id === userId) { unique = true; }
    // user with this email already exists and is not this user
    else if (user) { unique = false; }
    // no user with this email
    else { unique = true; }
    return unique;
  });
}
