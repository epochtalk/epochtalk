var path = require('path');
var rootPath = path.normalize(__dirname + '/..');

var config = {
  root: rootPath,
  port: process.env.PORT || 8090,
  logEnabled: process.env.LOG_ENABLED || true,
  publicUrl: 'http://localhost:8080',
  privateKey: process.env.PRIVATE_KEY || 'Change this to something more secure',
  bucketUrl: process.env.BUCKET_URL || 'https://epoch-dev.s3.amazonaws.com'
};

module.exports = config;
