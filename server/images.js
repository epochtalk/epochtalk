var proxy = {};
module.exports = proxy;

var crypto = require('crypto');
var path = require('path');
var config = require(path.join(__dirname, 'config'));
var memStore = require(path.join(__dirname, 'memstore')).db;

var client = require('pkgcloud').storage.createClient({
  provider: 'amazon',
  key: config.s3SecretKey,
  keyId: config.s3AccessKey,
  region: config.s3Region
});

proxy.hotlinkedUrl = function(url) {
  var cdnUrl = url;

  if (config.cdnUrl) {
    // set the image cdn method
    var method = crypto.createHash('sha1').update('hotlink').digest('hex');

    // encrypt the url
    var cipher = crypto.createCipher('aes-256-cbc', config.privateKey);
    var codedUrl = cipher.update(url,'utf8','hex');
    codedUrl += cipher.final('hex');

    if (config.cdnUrl.indexOf('/', config.cdnUrl.length-1) === -1) {
      cdnUrl = config.cdnUrl + '/';
    }
    cdnUrl += method + '/' + codedUrl;
  }
  
  return cdnUrl;
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