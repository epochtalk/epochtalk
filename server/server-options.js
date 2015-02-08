var path = require('path');
var config = require(path.join(__dirname, '..', 'config'));

module.exports = {
  // cors disabled by default
  host: 'localhost',
  port: config.port,
  routes: {
    files: { relativeTo: path.join(__dirname, '..', 'public') },
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
