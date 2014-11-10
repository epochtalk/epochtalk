var path = require('path');
var rootPath = path.normalize(__dirname + '/..');

var config = {
  root: rootPath,
  port: process.env.PORT || 8080,
  logEnabled: true,
  senderEmail: 'info@epochtalk.com',
  hostUrl: 'http://localhost',
  privateKey: 'Change this to something more secure'
};

module.exports = config;
