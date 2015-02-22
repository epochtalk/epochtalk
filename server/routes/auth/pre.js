var path = require('path');
var Hapi = require('hapi');
var Boom = require('boom');
var db = require(path.join(__dirname, '..', '..', '..', 'db'));

module.exports = {
  checkUniqueEmail: function(request, reply) {
    var email = request.payload.email;
    db.users.userByEmail(email).then(function(user) {
      if (user) {
        var error = Boom.badRequest('Email Already Exists');
        return reply(error);
      }
      return reply();
    });
  },
  checkUniqueUsername: function(request, reply) {
    var username = request.payload.username;
    db.users.userByUsername(username).then(function(user) {
      if (user) {
        var error = Boom.badRequest('Username Already Exists');
        return reply(error);
      }
      return reply();
    });
  }
};
