var core = require('epochcore')();
var Hapi = require('hapi');

module.exports = {
  checkUsername: function(request, reply) {
    var username = request.payload.username;
    core.users.userByUsername(username)
    .then(function(threads) {
      var error = Hapi.error.badRequest('Username Already Exists');
      return reply(error);
    })
    .catch(function(err) { return reply(); });
  },
  checkEmail: function(request, reply) {
    var email = request.payload.email;
    core.users.userByEmail(email)
    .then(function(thread) {
      var error = Hapi.error.badRequest('Email Already Exists');
      return reply(error);
    })
    .catch(function(err) { return reply(); });
  }
};
