var path = require('path');
var database = require(path.normalize(__dirname + '/database.json'));

var parseBool = function(value) {
  var result = false;
  if (value === 'true') { result = true; }
  else if (value === 'True') { result = true; }
  else if (value === 'TRUE') { result = true; }
  else if (value === '1') { result = true; }
  return result;
};

var config = {
  root: path.normalize(__dirname),
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 8080,
  logEnabled: parseBool(process.env.LOG_ENABLED) || true,
  publicUrl: process.env.PUBLIC_URL || 'http://localhost:8080',
  privateKey: process.env.PRIVATE_KEY || 'Change this to something more secure',
  loginRequired: parseBool(process.env.LOGIN_REQUIRED) || false,
  images: {
    storage: process.env.IMAGES_STORAGE || 'local',
    root: process.env.IMAGES_URL_ROOT || 'http://localhost',
    dir: process.env.IMAGES_URL_DIR || 'images',
    maxSize: process.env.IMAGES_MAX_SIZE || 10485760,
    expiration: process.env.IMAGES_EXPIRATION || 1000 * 60 * 60 * 2,
    interval: process.env.IMAGES_INTERVAL || 1000 * 60 * 15,
    s3: {
      bucket: process.env.S3_BUCKET || 'bukkit',
      region: process.env.S3_REGION || 'region',
      accessKey: process.env.S3_ACCESS_KEY || 'testkey',
      secretKey: process.env.S3_SECRET_KEY || 'testkey',
    }
  }
};

// parse images root and dir
var root = config.images.root;
if (root.indexOf('/', root.length-1) === -1) {
  config.images.root = root + '/';
}
var dir = config.images.dir;
if (dir.indexOf('/', dir.length-1) === -1) {
  dir += '/';
  config.images.dir = dir;
}
if (dir.indexOf('/') === 0) {
  config.images.dir = dir.substring(1);
}

// add db config
var env = process.env.NODE_ENV || 'development';
config.db = database[env];

module.exports = config;
