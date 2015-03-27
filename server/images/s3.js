var s3 = {};
module.exports = s3;

var path = require('path');
var mmm = require('mmmagic');
var crypto = require('crypto');
var request = require('request');
var through2 = require('through2');
var pkgcloud = require('pkgcloud');
var images = require(path.normalize(__dirname + '/index'));
var config = require(path.normalize(__dirname + '/../../config'));
var Magic = mmm.Magic;
var client = pkgcloud.storage.createClient({
    provider: 'amazon',
    key: config.images.s3.secretKey,
    keyId: config.images.s3.accessKey,
    region: config.images.s3.region
  });

s3.uploadPolicy = function(filename) {
  var imageName = images.generateUploadFilename(filename);
  var imageUrl = generateImageUrl(imageName);
  var key = config.images.s3.dir + imageName;

  // build policy
  var expiration = new Date();
  expiration.setMinutes(expiration.getMinutes() + 5);
  expiration = expiration.toISOString();
  var conditions = [];
  conditions.push({bucket: config.images.s3.bucket});
  conditions.push(['starts-with', '$key', key]);
  conditions.push({'acl': 'public-read'});
  conditions.push(['starts-with', '$Content-Type', 'image']);
  conditions.push(['content-length-range', 1024, config.images.maxSize]);
  var policy = { expiration: expiration, conditions: conditions };
  policy = JSON.stringify(policy);
  policy = new Buffer(policy).toString('base64');

  // sign policy to generate signature
  var signature = crypto.createHmac('sha1', config.images.s3.secretKey).update(new Buffer(policy)).digest('base64');

  // add this imageUrl to the image expiration
  images.setExpiration(config.images.expiration, imageUrl);

  return {
    policy: policy,
    signature: signature,
    accessKey: config.images.s3.accessKey,
    uploadUrl: config.images.s3.root,
    key: key,
    imageUrl: imageUrl
  };
};

s3.saveImage = function(imgSrc) {
  var url;

  // image uploaded by client
  if (imgSrc.indexOf(config.images.s3.root) === 0) {
    // clear any expirations
    images.clearExpiration(imgSrc);
  }
  // hotlink image
  else {
    var filename = images.generateHotlinkFilename(imgSrc);
    uploadImage(imgSrc, filename);
    url = generateImageUrl(filename);
  }

  return url;
};

var generateImageUrl = function(filename) {
  var imageUrl = config.images.s3.root;
  imageUrl += config.images.s3.dir + filename;
  return imageUrl;
};

var uploadImage = function(url, filename) {
  // check if this already exists in cdn
  var s3Url = generateImageUrl(filename);
  request.head(s3Url, function(err, response) {
    // if it already exists, just return
    if (response && response.statusCode === 200) { return; }
    else { // otherwise, try uploading image to cdn
      var options = {
        container: config.images.s3.bucket,
        remote: config.images.s3.dir + filename,
        acl: 'public-read'
      };

      // check file type
      var newStream = true;
      var fileTypeCheck = new Magic(mmm.MAGIC_MIME_TYPE);
      var ftc = through2(function(chunk, enc, cb) {
        fileTypeCheck.detect(chunk, function(err, result) {
          var error;
          if (err) { error = err; }

          // check results
          if (result && newStream) {
            newStream = false;
            if (result.indexOf('image') !== 0) {
              error = new Error('Invalid File Type');
            }
          }

          // next
          return cb(error, chunk);
        });
      });
      ftc.on('error', function(err) { return console.log(err); });

      // write to cdn
      var writeStream = client.upload(options);
      writeStream.on('error', function(err) { return console.log(err); });
      writeStream.on('success', function(file) { return; });

      // get image from url and pipe to cdn
      request(url)
      .on('error', function(err) { console.log(err); })
      .pipe(ftc)
      .pipe(writeStream);
    }
  });
};

s3.removeImage = function(imageUrl) {
  var root = config.images.s3.root;
  var file = imageUrl.replace(root, '');
  client.removeFile(config.images.s3.bucket, file, function(err) {
    if (err) { console.log(err); }
  });
};
