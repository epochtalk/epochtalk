var images = {};
module.exports = images;

var path = require('path');
var crypto = require('crypto');
var s3 = require(path.normalize(__dirname + '/s3'));
var db = require(path.normalize(__dirname + '/../../db'));
var local = require(path.normalize(__dirname + '/local'));
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
  var expiration = new Date(Date.now() + duration);
  db.images.addImageExpiration(url, expiration);
};

images.clearExpiration = function(url) {
  db.images.clearImageExpiration(url);
};

var expire = function() {
  var storageType = config.images.storage;
  db.images.getExpiredImages()
  .each(function(image) {
    // remove from cdn
    images[storageType].removeImage(image.image_url);
    // clear from db
    images.clearExpiration(image.image_url);
  });
};

// Image References

images.addPostImageReference = function(postId, imageUrl) {
  return db.images.addPostImage(postId, imageUrl);
};

images.removePostImageReferences = function(postId) {
  return db.images.removePostImages(postId);
};

var clearImageReferences = function() {
  var storageType = config.images.storage;
  db.images.getDeletedPostImages()
  .each(function(imageReference) {
    return checkImageReferences(imageReference.image_url)
    // if true, delete image
    .then(function(noMoreReferences) {
      if (noMoreReferences) {
        images[storageType].removeImage(imageReference.image_url);
      }
    })
    // delete this reference
    .then(function() {
      db.images.deleteImageReference(imageReference.id);
    })
    ;
  });
};

var checkImageReferences = function(imageUrl) {
  var noMoreReferences = true;
  return db.images.getImageReferences(imageUrl)
  .each(function(reference) {
    if (reference.post_id) { noMoreReferences = false; }
  })
  .then(function() { return noMoreReferences; });
};

setInterval(expire, config.images.interval);
setInterval(clearImageReferences, config.images.interval);
