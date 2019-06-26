var Boom = require('boom');

exports.register = function(plugin, options, next) {
  plugin.ext('onPostAuth', function(request, reply) {
    // check if user is authed
    var authed = request.auth.isAuthenticated;
    if (!authed) { return reply.continue(); }

    // get this user's id
    var userId = request.auth.credentials.id;

    // reply here but continue the rest as a separate process
    reply.continue();

    // get lastActive for this user
    request.db.users.getLastActive(userId)
    .then(function(lastActive) {
      // if no lastActive, then just update
      if (!lastActive) { return true; }

      // diff in minutes between lastActive and now
      var update = false;
      var diffMs = (new Date() - lastActive);
      var minutes = Math.floor(diffMs / 60000);
      if (minutes) { update = true; }

      return update;
    })
    .then(function(doUpdate) {
      if (doUpdate) { request.db.users.setLastActive(userId); }
    });
  });

  next();
};

exports.register.attributes = {
  name: 'lastActive',
  version: '1.0.0'
};
