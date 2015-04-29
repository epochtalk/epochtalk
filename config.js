var path = require('path');
var database = require(path.normalize(__dirname + '/database.json'));

var parseBool = function(value, defaultValue) {
  var result = defaultValue || false;
  value = typeof value === 'string' ? value.toLowerCase() : value;
  if (value === 'true') { result = true; }
  else if (value === 'false') { result = false; }
  return result;
};

var config = {
  root: path.normalize(__dirname),
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 8080,
  logEnabled: parseBool(process.env.LOG_ENABLED, true),
  publicUrl: process.env.PUBLIC_URL || 'http://localhost:8080/',
  privateKey: process.env.PRIVATE_KEY || 'Change this to something more secure',
  verifyRegistration: parseBool(process.env.VERIFY_REGISTRATION, true),
  loginRequired: parseBool(process.env.LOGIN_REQUIRED, false),
  website: {
    title: process.env.WEBSITE_TITLE || 'Epochtalk Forums',
    description: process.env.WEBSITE_DESCRIPTION || 'Open source forum software',
    keywords: process.env.WEBSITE_KEYWORDS || 'open source, free forum, forum software, forum',
    logo: process.env.WEBSITE_LOGO || '',
    favicon: process.env.WEBSITE_FAVICON || ''
  },
  emailer: {
    sender: process.env.EMAILER_SENDER || 'info@example.com',
    host: process.env.EMAILER_HOST || 'smtp.gmail.com',
    port: process.env.EMAILER_PORT || 465,
    user: process.env.EMAILER_USER || 'username',
    pass: process.env.EMAILER_PASS || 'password',
    secure: parseBool(process.env.EMAILER_SECURE, true)
  },
  images: {
    storage: process.env.IMAGES_STORAGE || 'local',
    maxSize: process.env.IMAGES_MAX_SIZE || 10485760,
    expiration: process.env.IMAGES_EXPIRATION || 1000 * 60 * 60 * 2,
    interval: process.env.IMAGES_INTERVAL || 1000 * 60 * 15,
    local: {
      dir: process.env.IMAGES_LOCAL_DIR || 'public/images',
      path: process.env.IMAGES_LOCAL_PATH || 'static/images'
    },
    s3: {
      root: process.env.IMAGES_S3_ROOT || 'http://some.where',
      dir: process.env.IMAGES_S3_DIR || '/images',
      bucket: process.env.IMAGES_S3_BUCKET || 'bukkit',
      region: process.env.IMAGES_S3_REGION || 'region',
      accessKey: process.env.IMAGES_S3_ACCESS_KEY || 'testkey',
      secretKey: process.env.IMAGES_S3_SECRET_KEY || 'testkey',
    }
  }
};


// parse public url
var publicUrl = config.publicUrl;
if (publicUrl.indexOf('/', publicUrl.length-1) === publicUrl.length-1) {
  config.publicUrl = publicUrl.substring(0, publicUrl.length-1);
}


// parse images local dir
var localDir = config.images.local.dir;
if (localDir.indexOf('/') !== 0) {
  config.images.local.dir = '/' + localDir;
  localDir =  '/' + localDir;
}
if (localDir.indexOf('/', localDir.length-1) === -1) {
  config.images.local.dir = localDir + '/';
}
// parse images public dir
var localPath = config.images.local.path;
if (localPath.indexOf('/') !== 0) {
  config.images.local.path = '/' + localPath;
  localPath = '/' + localPath;
}
if (localPath.indexOf('/', localPath.length-1) === -1) {
  config.images.local.path = localPath + '/';
}


// parse images root and dir
var s3root = config.images.s3.root;
if (s3root.indexOf('/', s3root.length-1) === -1) {
  config.images.s3.root = s3root + '/';
}
var s3dir = config.images.s3.dir;
if (s3dir.indexOf('/', s3dir.length-1) === -1) {
  s3dir += '/';
  config.images.s3.dir = s3dir;
}
if (s3dir.indexOf('/') === 0) {
  config.images.s3.dir = s3dir.substring(1);
}


// add db config
var env = process.env.NODE_ENV || 'development';
config.db = database[env];

module.exports = config;
