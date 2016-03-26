var db;
var _ = require('lodash');

exports.register = function(server, options, next) {
  if (!options.db) { return next(new Error('No DB found in Track IP')); }
  db = options.db;

  server.ext('onPostHandler', function(request, reply) {
    reply.continue();
    // If credentials are present and track_ip is true
    if (request.auth.credentials && _.get(request, 'route.settings.plugins.track_ip')) {
      var ip = request.headers['x-forwarded-for'] || request.info.remoteAddress;
      db.users.trackIp(request.auth.credentials.id, ip);
    }
  });

  next();
};

exports.register.attributes = {
  name: 'track_ip',
  version: '1.0.0'
};
