var upload = {};
module.exports = upload;

var crypto = require('crypto');
var path = require('path');
var config = require(path.join(__dirname, 'config'));

upload.url = function(url) {
  var cdnUrl = url;

  if (config.cdnUrl) {
    // set the image cdn method
    var method = crypto.createHash('sha256').update('hotlink').digest('hex');

    // encrypt the url
    var cipher = crypto.createCipher('aes-256-cbc', config.privateKey);
    var codedUrl = cipher.update(url,'utf8','hex');
    codedUrl += cipher.final('hex');

    if (config.cdnUrl.indexOf('/', config.cdnUrl.length - 1) !== -1) {
      cdnUrl = config.cdnUrl + method + codedUrl;
    }
    else {
      cdnUrl = config.cdnUrl + '/' + method + '/' + codedUrl;
    }
  }
  
  return cdnUrl;
};

