var images = {};
module.exports = images;

var path = require('path');
var crypto = require('crypto');
var s3 = require(path.normalize(__dirname + '/s3'));
var local = require(path.normalize(__dirname + '/local'));
var imageHandlers = {};
var expireHandle;
var clearHandle;
var config;
var db;

images.init = function(opts) {
  opts = opts || {};
  db = opts.db;
  config = opts.config;

  s3.init(opts);
  local.init(opts);
  imageHandlers.s3 = s3;
  imageHandlers.local = local;

  clearInterval(expireHandle);
  expireHandle = setInterval(expire, config.images.interval);

  clearInterval(clearHandle);
  clearHandle = setInterval(clearImageReferences, config.images.interval);
};

// interface api

images.saveImage = (imgSrc) => {
  return imageHandlers[config.images.storage].saveImage(imgSrc);
};

images.uploadPolicy = (filename) => {
  return imageHandlers[config.images.storage].uploadPolicy(filename);
};

images.uploadImage = local.uploadImage;

// -- public api

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

// Image References
// TODO: should respect where the images are saved to

images.addPostImageReference = function(postId, imageUrl) {
  return db.images.addPostImage(postId, imageUrl);
};

images.removePostImageReferences = function(postId) {
  return db.images.removePostImages(postId);
};

// image cleaning intervals

var expire = function() {
  var storageType = config.images.storage;
  db.images.getExpiredImages()
  .each(function(image) {
    // remove from cdn
    imageHandlers[storageType].removeImage(image.image_url);
    // clear from db
    images.clearExpiration(image.image_url);
  });
};

var clearImageReferences = function() {
  var storageType = config.images.storage;
  db.images.getDeletedPostImages()
  .each(function(imageReference) {
    return checkImageReferences(imageReference.image_url)
    // if true, delete image
    .then(function(noMoreReferences) {
      if (noMoreReferences) {
        imageHandlers[storageType].removeImage(imageReference.image_url);
      }
    })
    // delete this reference
    .then(function() {
      db.images.deleteImageReference(imageReference.id);
    });
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
