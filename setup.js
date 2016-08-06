var _ = require('lodash');
var Promise = require('bluebird');
var path = require('path');
var config = require(path.normalize(__dirname + '/config'));
var db = require(path.normalize(__dirname + '/db'));
var defaultConfigurations = require(path.join(__dirname, 'configurations.json'));

// load admin options from database
module.exports = function() {
  return db.configurations.get()
  // if admin options are not yet configured
  .error(function() {
    // create with defaults
    console.log('Not configured yet; using default configurations...');
    return parseConfigs(defaultConfigurations)
    .then(function() {
      return db.configurations.create(config);
    })
    .then(function() { return config; });
  })
  .then(parseConfigs);
};

function parseConfigs(configurations) {
  return new Promise(function(resolve, reject) {
    Object.keys(configurations).forEach(function(key) {
      if (config[key] === undefined) {
        config[key] = configurations[key];
      }
    });

    // check if the private key is configured
    if (!_.isString(config.privateKey)) {
      return reject(new Error('PRIVATE_KEY is not set to a valid value.'));
    }

    // check if the recaptcha site key is configured
    if (!_.isString(config.recaptchaSiteKey)) {
      return reject(new Error('RECAPTCHA_SITE_KEY is not set.'));
    }

    if (!_.isString(config.recaptchaSecretKey)) {
      return reject(new Error('RECAPTCHA_SECRET_KEY is not set.'));
    }

    // parse public url
    var publicUrl = config.publicUrl;
    if (!publicUrl.startsWith('http')) {
      return reject(new Error('PUBLIC URL does not start with http'));
    }

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

    return resolve();
  })
  .then(function() {
    return checkEmailerConfig(config.emailer);
  })
  .then(function() {
    return checkImagesConfig(config.images);
  });
}

function checkEmailerConfig(emailer) {
  return new Promise(function(resolve, reject) {
    if (!emailer) { return reject(new Error('Emailer configuration not found.')); }

    var errors = [];
    if (!emailer.sender) { errors.push('Emailer Sender not found.'); }
    if (!emailer.host) { errors.push('Emailer Host not found.'); }
    if (!emailer.port) { errors.push('Emailer Post not found.'); }
    if (!emailer.user) { errors.push('Emailer User not found.'); }
    if (!emailer.pass) { errors.push('Emailer Password not found.'); }

    if (errors.length > 0) { return reject(new Error(errors.join('\n'))); }
    else { return resolve(); }
  });
}

function checkImagesConfig(images) {
  return new Promise(function(resolve, reject) {
    if (!images) { return reject(new Error('Images configuration not found')); }

    var errors = [];
    var storageType = images.storage;

    if (!storageType) { errors.push('Image Storage Type not found.'); }
    else if (storageType !== 'local' && storageType !== 's3') {
      errors.push('Image Type is not "local" or "s3"');
    }
    if (!images.maxSize) { errors.push('Max Image Size not set.'); }
    if (!images.expiration) { errors.push('Image Expiration Interval not set.'); }
    if (!images.interval) { errors.push('Image Check Interval not set.'); }

    // local
    if (storageType === 'local') {
      if (!images.local.dir) { errors.push('Local Images dir not set.'); }
      if (!images.local.path) { errors.push('Local Images public path not set.'); }
    }

    // s3
    if (storageType === 's3') {
      if (!images.s3.root) { errors.push('S3 root URL not set.'); }
      if (!images.s3.dir) { errors.push('S3 dir not set.'); }
      if (!images.s3.bucket) { errors.push('S3 bucket not set.'); }
      if (!images.s3.region) { errors.push('S3 region not set.'); }
      if (!images.s3.accessKey) { errors.push('S3 Access Key not set.'); }
      if (!images.s3.secretKey) { errors.push('S3 Secret Key not set.'); }
    }

    if (errors.length > 0) { return reject(new Error(errors.join('\n'))); }
    else { return resolve(); }
  });
}
