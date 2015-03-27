var images = {};
module.exports = images;

var path = require('path');
var crypto = require('crypto');
var s3 = require(path.normalize(__dirname + '/s3'));
var local = require(path.normalize(__dirname + '/local'));
var memStore = require(path.normalize(__dirname + '/../memstore')).db;
var config = require(path.normalize(__dirname + '/../../config'));

images.s3 = s3;
images.local = local;

// Image Shared
images.generateHotlinkFilename = function(filename) {
  var ext = path.extname(filename);
  var hash = crypto.createHash('sha1')
  .update(filename)
  .digest('hex');
  return hash + ext;
};

images.generateUploadFilename = function(filename) {
  var ext = path.extname(filename);
  var hash = crypto.createHash('sha1')
  .update(filename)
  .update(Date.now().toString())
  .digest('hex');
  return hash + ext;
};

// Image Expiration

images.setExpiration = function(duration, url) {
  var expiration = Date.now() + duration;

  var contentKey = url;
  var contentValue = expiration;

  var indexKey = 'image' + expiration;
  var indexValue = url;

  memStore.putAsync(contentKey, contentValue);
  memStore.putAsync(indexKey, indexValue);
};

images.clearExpiration = function(url) {
  memStore.getAsync(url)
  .then(function(expiration) {
    memStore.delAsync(url); // delete content
    memStore.delAsync('image' + expiration); // delete index
  })
  .catch(function() {});
};

var expire = function() {
  memStore.imageQuery()
  .then(function(images) {
    images.forEach(function(image) {
      var url = image.value;
      // remove from storage
      var storage = config.images.storage;
      images[storage].removeImage(url);
      // clear from memStore
      proxy.clearExpiration(url);
    });
  });
};

setInterval(expire, config.images.interval);
