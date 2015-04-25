var path = require('path');
var Boom = require('boom');
var db = require(path.normalize(__dirname + '/../../../../db'));

module.exports = {
  adminCheck: function(request, reply) {
    if (request.auth.isAuthenticated) {
      var username = request.auth.credentials.username;
      return db.users.userByUsername(username)
      .then(function(user) {
        var isAdmin = false;
        user.roles.forEach(function(role) {
          if (role.name === 'Administrator') { isAdmin = true; }
        });
        return reply(isAdmin || Boom.unauthorized());
      })
      .catch(function() { return reply(Boom.unauthorized()); });
    }
    else { return reply(Boom.unauthorized()); }
  }
};
