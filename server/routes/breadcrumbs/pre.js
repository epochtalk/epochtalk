var path = require('path');
var config = require(path.join(__dirname, '..', '..', '..', 'config'));

module.exports = {
  requireLogin: function(request, reply) {
    if (config.loginRequired) { return reply(request.auth.isAuthenticated); }
    else { return reply(true); }
  }
};
