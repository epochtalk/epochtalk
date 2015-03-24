var proxy = {};
module.exports = proxy;

var crypto = require('crypto');
var path = require('path');
var request = require('request');
var mmm = require('mmmagic');
var through2 = require('through2');
var config = require(path.join(__dirname, '..', 'config'));
var memStore = require(path.join(__dirname, 'memstore')).db;
var Magic = mmm.Magic;
var client = require('pkgcloud').storage.createClient({
  provider: 'amazon',
  key: config.images.s3.secretKey,
  keyId: config.images.s3.accessKey,
  region: config.images.s3.region
});

proxy.uploadPolicy = function(filename) {
  var imageName = generateUploadFilename(filename);
  var imageUrl = generateImageUrl(imageName);
  var key = config.images.dir + imageName;

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

  // add this imageUrl to the image proxy expiry
  proxy.setExpiration(config.images.expiration, imageUrl);

  return {
    policy: policy,
    signature: signature,
    accessKey: config.images.s3.accessKey,
    uploadUrl: config.images.root,
    key: key,
    imageUrl: imageUrl
  };
};

proxy.saveImage = function(imgSrc) {
  var url;

  // image uploaded by client
  if (imgSrc.indexOf(config.images.root) === 0) {
    // clear any expirations
    proxy.clearExpiration(imgSrc);
  }
  // hotlink image
  else {
    var filename = generateHotlinkFilename(imgSrc);
    uploadImage(imgSrc, filename);
    url = generateImageUrl(filename);
  }

  return url;
};

var generateHotlinkFilename = function(filename) {
  var ext = path.extname(filename);
  var hash = crypto.createHash('sha1')
  .update(filename)
  .digest('hex');
  return hash + ext;
};

var generateUploadFilename = function(filename) {
  var ext = path.extname(filename);
  var hash = crypto.createHash('sha1')
  .update(filename)
  .update(Date.now().toString())
  .digest('hex');
  return hash + ext;
};

var generateImageUrl = function(filename) {
  var imageUrl = config.images.root;
  if (imageUrl.indexOf('/', imageUrl.length-1) === -1) { imageUrl += '/'; }
  imageUrl += config.images.dir + filename;
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
        remote: config.images.dir + filename,
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

// Image Expiration

proxy.setExpiration = function(duration, url) {
  var expiration = Date.now() + duration;

  var contentKey = url;
  var contentValue = expiration;

  var indexKey = 'image' + expiration;
  var indexValue = url;

  memStore.putAsync(contentKey, contentValue);
  memStore.putAsync(indexKey, indexValue);
};

proxy.clearExpiration = function(url) {
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
      // remove from s3
      var pathArray = url.split('/');
      var file = pathArray[pathArray.length-1];
      client.removeFile(config.images.s3.bucket, file, function(err) {
        if (err) { console.log(err); }
      });
      // clear from memStore
      proxy.clearExpiration(url);
    });
  });
};

setInterval(expire, config.images.interval);
