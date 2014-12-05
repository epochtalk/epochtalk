var proxy = {};
module.exports = proxy;

var crypto = require('crypto');
var path = require('path');
var request = require('request');
var mmm = require('mmmagic');
var through2 = require('through2');
var config = require(path.join(__dirname, 'config'));
var memStore = require(path.join(__dirname, 'memstore')).db;
var Magic = mmm.Magic;

var client = require('pkgcloud').storage.createClient({
  provider: 'amazon',
  key: config.s3SecretKey,
  keyId: config.s3AccessKey,
  region: config.s3Region
});

proxy.hotlinkedUrl = function(url) {
  var cdnUrl = url;

  if (config.cdnUrl) {
    // generate a url for the hotlink
    var result = generateHotlinkUrl(url);
    var filename = result.filename;
    cdnUrl = result.cdnUrl;

    // upload hotlinked image to s3
    uploadImage(url, filename);
  }
  
  return cdnUrl;
};

var generateHotlinkUrl = function(url) {
  // set the image cdn method
  var method = crypto.createHash('sha1').update('hotlink').digest('hex');

  // encrypt the url
  var cipher = crypto.createCipher('aes-256-cbc', config.privateKey);
  var codedUrl = cipher.update(url,'utf8','hex');
  codedUrl += cipher.final('hex');

  // construct the url with method and encryptedUrl
  var cdnUrl = config.cdnUrl;
  if (config.cdnUrl.indexOf('/', config.cdnUrl.length-1) === -1) {
    cdnUrl += '/';
  }
  cdnUrl += method + '/' + codedUrl;
  return { cdnUrl: cdnUrl, filename: codedUrl };
};

var uploadImage = function(url, filename) {
  var s3Url = config.bucketUrl;
  if (s3Url.indexOf('/', s3Url.length-1) === -1) { s3Url += '/'; }
  s3Url += 'images/';
  s3Url += filename;

  // check if this already exists in cdn
  request.head(s3Url, function(err, response) {
    // if it already exists, just return
    if (response && response.statusCode === 200) { return; }
    else { // otherwise, try uploading image to cdn
      var options = {
        container: 'epoch-dev/images',
        remote: filename,
        acl: 'public-read'
      };
      var writeStream = client.upload(options);
      writeStream.on('error', function(err) { return console.log(err); });
      writeStream.on('success', function(file) { return; });

      // check file type
      var fileTypeCheck = new Magic(mmm.MAGIC_MIME_TYPE);
      var ftc = through2(function(chunk, enc, cb) {
        fileTypeCheck.detect(chunk, function(err, result) {
          var error;
          if (err) { error = err; }

          // check results
          if (!result ||
              result.indexOf('image') !== 0 &&
              result.indexOf('application/octet-stream') !== 0) {
            error = new Error('Invalid File Type');
          }

          // next
          return cb(error, chunk);
        });
      });
      ftc.on('error', function(err) { return console.log(err); });

      // get image from url and pipe to cdn
      request(url).pipe(ftc).pipe(writeStream);
    }
  });
};


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
    console.log(expiration);
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
      file = 'images/' + file;
      client.removeFile(config.s3Bucket, file, function(err) {
        if (err) { console.log(err); }
      });
      // clear from memStore
      proxy.clearExpiration(url);
    });
  });
};

setInterval(expire, config.imageInterval);