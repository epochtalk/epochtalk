var path = require('path');
var rootPath = path.normalize(__dirname + '/..');

var config = {
  root: rootPath,
  port: process.env.PORT || 8090,
  logEnabled: process.env.LOG_ENABLED || true,
  publicUrl: 'http://localhost:8080',
  privateKey: process.env.PRIVATE_KEY || 'Change this to something more secure',
  s3AccessKey: process.env.S3_ACCESS_KEY || 'this is not work',
  s3SecretKey: process.env.S3_SECRET_KEY || 'this is not work',
  maxImageSize: process.env.MAX_IMAGE_SIZE || 10240000
};

module.exports = config;
