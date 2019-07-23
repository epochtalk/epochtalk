var db;
var _ = require('lodash');

module.exports = {
  name: 'track_ip',
  version: '1.0.0',
  register: async function(server, options) {
    if (!options.db) { return new Error('No DB found in Track IP'); }
    db = options.db;

    server.ext('onPostHandler', function(request, reply) {
      // If credentials are present and track_ip is true
      if (request.auth.credentials && _.get(request, 'route.settings.plugins.track_ip')) {
        var ip = request.headers['x-forwarded-for'] || request.info.remoteAddress;
        db.users.trackIp(request.auth.credentials.id, ip);
      }
      return reply.continue;
    });
  }
};
