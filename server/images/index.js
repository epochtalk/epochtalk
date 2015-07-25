var images = {};
module.exports = images;

var path = require('path');
var crypto = require('crypto');
var s3 = require(path.normalize(__dirname + '/s3'));
var local = require(path.normalize(__dirname + '/local'));
var config = require(path.normalize(__dirname + '/../../config'));
var redis = require(path.normalize(__dirname + '/../../redis'));

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

  redis.putAsync(contentKey, contentValue);
  redis.putAsync(indexKey, indexValue);
};

images.clearExpiration = function(url) {
  redis.getAsync(url)
  .then(function(expiration) {
    redis.delAsync(url); // delete content
    redis.delAsync('image' + expiration); // delete index
  })
  .catch(function() {});
};

var imageQuery = function() {
  // return new Promise(function(fulfill, reject) {
    // var entries = [];
    // var sorter = function(entry) { entries.push(entry); };
    // var handler = function() { return fulfill(entries); };
    //
    // // query key
    // var startKey = 'image' + 0;
    // var endKey = 'image' + Date.now();
    // var queryOptions = {
    //   gte: startKey,
    //   lte: endKey
    // };
    //
    // memDb.createReadStream(queryOptions)
    // .on('data', sorter)
    // .on('error', reject)
    // .on('close', handler)
    // .on('end', handler);
  // });
};

var expire = function() {
  // imageQuery()
  // .then(function(expiredImages) {
  //   expiredImages.forEach(function(image) {
  //     var url = image.value;
  //     // remove from storage
  //     var storage = config.images.storage;
  //     images[storage].removeImage(url);
  //     // clear from redis
  //     images.clearExpiration(url);
  //   });
  // });
};

setInterval(expire, config.images.interval);
