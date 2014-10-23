var path = require('path');
var Hapi = require('hapi');
var core = require('epochcore')();

module.exports = {
  getCurrentUser: function(request, reply) {
    // get user id from auth
    var userId = request.auth.credentials.id;
    core.users.find(userId)
    .then(function(user) { return reply(user); })
    .catch(function(err) { return reply(err); });
  },
  checkUsernameUniqueness: function(request, reply) {
    if (!request.payload.username) {
      return reply();
    }

    var userId = request.auth.credentials.id;
    core.users.find(userId)
    .then(function(user) {
      // check if username has changed
      if (user.username === request.payload.username) {
        return reply();
      }
      else {
        // check that new username is unique
        var newUsername = request.payload.username;
        core.users.userByUsername(newUsername)
        .then(function(existingUser) {
          // throw error
          var usernameError = Hapi.error.badRequest('Username Already Exists');
          return reply(usernameError);
        })
        .catch(function(err) {
          return reply();
        });
      }
    });
  },
  checkEmailUniqueness: function(request, reply) {
    if (!request.payload.email) {
      return reply();
    }

    var userId = request.auth.credentials.id;
    core.users.find(userId)
    .then(function(user) {
      // check if email has changed
      if (user.email === request.payload.email) {
        return reply();
      }
      else {
        // check that new email is unique
        var newEmail = request.payload.email;
        core.users.userByEmail(newEmail)
        .then(function(existingUser) {
          // throw Error
          var emailError = Hapi.error.badRequest('Email Already Exists');
          return reply(emailError);
        })
        .catch(function(err) {
          return reply();
        });
      }
    });
  }
};
