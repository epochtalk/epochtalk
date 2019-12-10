var db;
var _ = require('lodash');
var ipAddress = require('ip-address');
var Address4 = ipAddress.Address4;
var Address6 = ipAddress.Address6;

module.exports = {
  name: 'track_ip',
  version: '1.0.0',
  register: async function(server, options) {
    if (!options.db) { return new Error('No DB found in Track IP'); }
    db = options.db;

    server.ext('onPostHandler', function(request, h) {
      var user = request.auth.credentials;
      // If credentials are present and track_ip is true
      if (user && user.id && _.get(request, 'route.settings.plugins.track_ip')) {
        var xFF = request.headers['x-forwarded-for']
        var ip = xFF ? xFF.split(',')[0] : request.info.remoteAddress;
        var isValidIpv4 = new Address4(ip).isValid();
        var isValidIpv6 = new Address6(ip).isValid();
        if (isValidIpv4 || isValidIpv6) {
          db.users.trackIp(user.id, ip);
        }
      }
      return h.continue;
    });
  }
};
