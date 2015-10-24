var path = require('path');
var config = require(path.normalize(__dirname + '/../config'));

module.exports = {
  // cors disabled by default
  host: config.host,
  port: config.port,
  routes: {
    validate: {
      options: {
        stripUnknown: true
      }
    },
    security: {
      hsts: true,
      xframe: true,
      xss: true,
      noOpen: true,
      noSniff: true
    }
  }
};
