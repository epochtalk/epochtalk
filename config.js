var path = require('path');
var config = {
  root: path.normalize(__dirname),
  db: process.env.DB,
  port: process.env.PORT || 8080,
  logEnabled: process.env.LOG_ENABLED || true,
  publicUrl: process.env.PUBLIC_URL || 'http://localhost:8080',
  privateKey: process.env.PRIVATE_KEY || 'Change this to something more secure',
  cdnUrl: process.env.CDN_URL || 'http://localhost:8280/images',
  s3Bucket: process.env.S3_BUCKET || 'epoch-dev',
  s3Region: process.env.S3_REGION || 'us-west-2',
  bucketUrl: process.env.BUCKET_URL || 'https://epoch-dev.s3.amazonaws.com',
  s3AccessKey: process.env.S3_ACCESS_KEY || 'testkey',
  s3SecretKey: process.env.S3_SECRET_KEY || 'testkey',
  maxImageSize: process.env.MAX_IMAGE_SIZE || 10485760,
  imageExpiration: process.env.IMAGE_EXPIRATION || 1000 * 60 * 60 * 2,
  imageInterval: process.env.IMAGE_INTERVAL || 1000 * 60 * 15
};

var json = require(path.join(__dirname, 'config.json'));
for (var key in json) config[key] = json[key];

module.exports = config;
