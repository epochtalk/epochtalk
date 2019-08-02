var Boom = require('boom');

module.exports = {
  name: 'lastActive',
  version: '1.0.0',
  register: async function(plugin, options) {
    plugin.ext('onPostAuth', function(request, h) {
      // check if user is authed
      var authed = request.auth.isAuthenticated;
      if (!authed) { return h.continue; }

      // get this user's id
      var userId = request.auth.credentials.id;

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
        if (doUpdate) { return request.db.users.setLastActive(userId); }
      });
      return h.continue;
    });
  }
};
