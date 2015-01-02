var path = require('path');
var core = require(path.join(__dirname, '..', '..', '..', 'db'));
var Hapi = require('hapi');

module.exports = {
  checkUsername: function(request, reply) {
    var username = request.payload.username;
    core.users.userByUsername(username)
    .then(function(user) {
      if (user) {
        var error = Hapi.error.badRequest('Username Already Exists');
        return reply(error);
      }
      else {
        return reply();
      }
    });
  },
  checkEmail: function(request, reply) {
    var email = request.payload.email;
    core.users.userByEmail(email)
    .then(function(user) {
      if (user) {
        var error = Hapi.error.badRequest('Email Already Exists');
        return reply(error);
      }
      else {
        return reply();
      }
    })
    .catch(function() { return reply(); });
  }
};
