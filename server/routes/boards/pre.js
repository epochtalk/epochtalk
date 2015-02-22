var path = require('path');
var Boom = require('boom');
var db = require(path.join(__dirname, '..', '..', '..', 'db'));
var sanitizer = require(path.join('..', '..', '..', 'sanitizer'));

module.exports = {
  clean: function(request, reply) {
    request.payload.name = sanitizer.strip(request.payload.name);
    if (request.payload.description) {
      request.payload.description = sanitizer.display(request.payload.description);
    }
    return reply();
  },
  adminCheck: function(request, reply) {
    var userId = request.auth.credentials.id;
    var error = Boom.unauthorized('You must be an admin to perform this action.');
    db.users.find(userId)
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
