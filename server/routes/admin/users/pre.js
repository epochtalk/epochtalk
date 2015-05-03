var path = require('path');
var Boom = require('boom');
var db = require(path.normalize(__dirname + '/../../../../db'));

module.exports = {
  checkUserExists: function(request, reply) {
    var userId = request.payload.id;
    db.users.find(userId)
    .then(function(user) {
      if (user) { return reply(user); }
      else { return Boom.badRequest('User Not Found'); }
    })
    .catch(function(err) { return reply(err); });
  },
  checkUsernameUniqueness: function(request, reply) {
    if (!request.payload.username) { return reply(); }
    var userId = request.payload.id;
    db.users.find(userId)
    .then(function(user) {
      // check if username has changed
      if (user.username === request.payload.username) { return reply(); }
      else {
        // check that new username is unique
        var newUsername = request.payload.username;
        db.users.userByUsername(newUsername)
        .then(function(user) {
          if (user) {
            var usernameError = Boom.badRequest('Username Already Exists');
            return reply(usernameError);
          }
          else { return reply(); }
        })
        .catch(function(err) { return reply(err); });
      }
    });
  },
  checkEmailUniqueness: function(request, reply) {
    if (!request.payload.email) { return reply(); }
    var userId = request.payload.id;
    db.users.find(userId)
    .then(function(user) {
      // check if email has changed
      if (user.email === request.payload.email) { return reply(); }
      else {
        // check that new email is unique
        var newEmail = request.payload.email;
        db.users.userByEmail(newEmail)
        .then(function(user) {
          if (user) {
            var emailError = Boom.badRequest('Email Already Exists');
            return reply(emailError);
          }
          else { return reply(); }
        })
        .catch(function(err) { return reply(err); });
      }
    });
  }
};
