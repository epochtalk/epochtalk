var path = require('path');
var rootPath = path.normalize(__dirname + '/..');

var config = {
  root: rootPath,
  port: process.env.PORT || 8080,
  logEnabled: process.env.LOG_ENABLED || true,
  publicUrl: 'http://localhost:8080',
  privateKey: process.env.PRIVATE_KEY || 'Change this to something more secure'
};

module.exports = config;
