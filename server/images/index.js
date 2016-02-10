var images = {};
var started = false;
module.exports = function() {
  // TODO: make into singleton
  if (started) { return images; }
  else { started = true; }

  // TODO: build an interface for these two libs
  // TODO: pass config object in rather than relying on require
  images.s3 = require(path.normalize(__dirname + '/s3'))();
  images.local = require(path.normalize(__dirname + '/local'));

  setInterval(expire, config.images.interval);
  setInterval(clearImageReferences, config.images.interval);

  return images;
};


var path = require('path');
var crypto = require('crypto');
var db = require(path.normalize(__dirname + '/../../db'));
var config = require(path.normalize(__dirname + '/../../config'));

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
// TODO: should respect where the images are saved to

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
