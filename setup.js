var path = require('path');
var config = require(path.normalize(__dirname + '/config'));
var db = require(path.normalize(__dirname + '/db'));
var defaultConfigurations = require(path.join(__dirname, 'configurations.json'));

// load admin options from database
module.exports = function() {
  return db.configurations.get().then(parseConfigs)
  .catch(function(err) {
    // if admin options are not yet configured
    if (err.isOperational) {
      console.log('Not configured yet; using default configurations...');
      // create with defaults
      return db.configurations.create(defaultConfigurations).then(function() {
        // then load admin options from database
        return db.configurations.get().then(parseConfigs);
      });
    }
    else { return console.log(err); }
  });
};

function parseConfigs(configurations) {
  Object.keys(configurations).forEach(function(key) {
    config[key] = configurations[key];
  });
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
}
