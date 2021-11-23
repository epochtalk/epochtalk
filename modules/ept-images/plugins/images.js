var images = {};
module.exports = images;

var path = require('path');
var crypto = require('crypto');
var cheerio = require('cheerio');
var Promise = require('bluebird');
var s3 = require(path.normalize(__dirname + '/s3'));
var local = require(path.normalize(__dirname + '/local'));
var imageHandlers = {};
var expireHandle;
var clearHandle;
var options;
var config;
var db;
var Boom = require('boom');

images.init = function(opts) {
  options = opts = opts || {};
  db = opts.db;
  config = opts.config;

  s3.init(opts);
  local.init(opts);
  imageHandlers.s3 = s3;
  imageHandlers.local = local;

  // image cleaning intervals

  clearInterval(expireHandle);
  expireHandle = setInterval(expire, config.images.interval);

  clearInterval(clearHandle);
  clearHandle = setInterval(clearImageReferences, config.images.interval);
};

images.reinit = function() { images.init(options); };

// -- interface api

images.saveImage = (imgSrc) => {
  if (imgSrc) { return imageHandlers[config.images.storage].saveImage(imgSrc); }
  else { return Promise.resolve(true); }
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
  var expiration = new Date(Number(Date.now()) + Number(duration));
  return db.images.addImageExpiration(url, expiration);
};

images.clearExpiration = function(url) {
  // url replace is a fix for vue project image expiry
  return db.images.clearImageExpiration(url.replace(config.publicUrl, ''));
};

var expire = function() {
  var storageType = config.images.storage;
  return db.images.getExpiredImages()
  .each(function(image) {
    // remove from cdn
    imageHandlers[storageType].removeImage(image.image_url);
    // clear from db
    images.clearExpiration(image.image_url);
  });
};

// Image References
// TODO: should respect where the images are saved to

images.imageSub = (post) => {
  var html;
  if (post.content) {
    html = post.content.body_html;
  }
  else {
    html = post.body_html;
  }
  // load html in post.body_html into cheerio
  var $ = cheerio.load(html);

  // collect all the images in the body
  var postImages = [];
  $('img').each((index, element) => { postImages.push(element); });

  // convert each image's src to cdn version
  return Promise.each(postImages, (element) => {
    var imgSrc = $(element).attr('src');
    return images.saveImage(imgSrc)
    .then(function(savedUrl) {
      if (savedUrl) {
        if (post.content) {
          post.content.body = post.content.body.replace(imgSrc, savedUrl);
        }
        else {
          post.body = post.body.replace(imgSrc, savedUrl);
        }
      }
    });
  })
  .then(() => { post.body_html = $.html(); })
  .then(() => post);
};

images.avatarSub = (user) => {
  if (!user.avatar) { return Promise.resolve(user); }
  else {
    return images.saveImage(user.avatar)
    .then(function(savedUrl) {
      user.avatar = savedUrl;
      return user;
    })
    .catch(function(err) {
      return Boom.badRequest(err);
    });
  }
};

images.addPostImageReference = function(postId, imageUrl) {
  return db.images.addPostImage(postId, imageUrl);
};

images.removePostImageReferences = function(postId) {
  return db.images.removePostImages(postId);
};

images.createImageReferences = (post) => {
  // load html in post.body_html into cheerio
  var html = post.body_html;
  var $ = cheerio.load(html);

  // collect all the images in the body
  var postImages = [];
  $('img').each((index, element) => { postImages.push(element); });

  // save all images with a reference to post
  postImages.map(function(element) {
    var imgSrc = $(element).attr('src');
    if (imgSrc.indexOf(config.images.s3.root) === 0) {
      return checkImageReferences(imgSrc)
      .then(function(noMoreReferences) {
        // If the src matches our s3 root and its not referenced in posts, then it is being
        // used elsewhere and should not be expired by being add to the posts image refs
        if (noMoreReferences) { return; }
        else { return images.addPostImageReference(post.id, imgSrc); }
      });
    }
    else { return images.addPostImageReference(post.id, imgSrc); }
  });

  return post;
};

images.updateImageReferences = (post) => {
  // load html in post.body_html into cheerio
  var html = post.body_html;
  var $ = cheerio.load(html);

  // collect all the images in the body
  var postImages = [];
  $('img').each((index, element) => { postImages.push(element); });

  // delete all image references for this post
  images.removePostImageReferences(post.id)
  .then(function() {
    // convert each image's src to cdn version
    postImages.map(function(element) {
      var imgSrc = $(element).attr('src');
      images.addPostImageReference(post.id, imgSrc);
    });
  });

  return post;
};

var clearImageReferences = function() {
  var storageType = config.images.storage;
  return db.images.getDeletedPostImages()
  .each(function(imageReference) {
    return checkImageReferences(imageReference.image_url)
    // if true, delete image
    .then(function(noMoreReferences) {
      if (noMoreReferences) {
        return imageHandlers[storageType].removeImage(imageReference.image_url);
      }
    })
    // delete this reference
    .then(function() {
      return db.images.deleteImageReference(imageReference.id);
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
