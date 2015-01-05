var path = require('path');
var Boom = require('boom');
var core = require('epoch-core-pg')();
var sanitize = require(path.join('..', '..', 'sanitize'));

module.exports = {
  clean: function(request, reply) {
    request.payload.name = sanitize.strip(request.payload.name);
    if (request.payload.description) {
      request.payload.description = sanitize.display(request.payload.description);
    }
    return reply();
  },
  adminCheck: function(request, reply) {
    var userId = request.auth.credentials.id;
    var error = Boom.unauthorized('You must be an admin to perform this action.');
    core.users.find(userId)
    .then(function(user) {
      if (!user) { return reply(error); }
      var isAdmin = false;
      user.roles.forEach(function(role) {
        if (role.name === 'Administrator') { isAdmin = true; }
      });
      if (isAdmin) { reply(); }
      else { return reply(error); }
    })
    .catch(function() {
      return reply(error);
    });
  },
};
