var path = require('path');
var Boom = require('boom');
var db = require(path.normalize(__dirname + '/../../../db'));

module.exports = {
  checkUniqueEmail: function(request, reply) {
    var email = request.payload.email;
    var promise = db.users.userByEmail(email)
    .then(function(user) {
      var result = true;
      if (user) { result = Boom.badRequest('Email Already Exists'); }
      return result;
    });
    return reply(promise);
  },
  checkUniqueUsername: function(request, reply) {
    var username = request.payload.username;
    var promise = db.users.userByUsername(username)
    .then(function(user) {
      var result = true;
      if (user) { result = Boom.badRequest('Username Already Exists'); }
      return result;
    });
    return reply(promise);
  }
};
