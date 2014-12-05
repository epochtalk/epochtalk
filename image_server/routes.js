/* jshint node: true */
'use strict';

var Hapi = require('hapi');
var crypto = require('crypto');
var path = require('path');
var request = require('request');
var config = require(path.join(__dirname, 'config'));

module.exports = [
  {
    method: 'GET',
    path: '/images/{method}/{options}',
    config: {
      handler: function(request, reply) {
        var method = request.params.method;
        var options = request.params.options;
        // find method signature
        var hotlink = crypto.createHash('sha1').update('hotlink').digest('hex');
        var s3 = crypto.createHash('sha1').update('s3').digest('hex');

        // figure out image method
        if (method === hotlink) { handleHotlink(options, reply); }
        else if (method === s3) { handleUpload(options, reply); }
        else { return reply(Hapi.error.badRequest()); }
      }
    }
  }
  // 404 routes?
];

var createS3Url = function(options) {
  var s3Url = config.bucketUrl;
  if (s3Url.indexOf('/', s3Url.length-1) === -1) { s3Url += '/'; }
  s3Url += 'images/';
  s3Url += options;
  return s3Url;
};

var handleHotlink = function(options, reply) {
  var s3Url = createS3Url(options);
  request.head(s3Url, function(err, response) {
    var proxyUrl = '';

    if (response && response.statusCode === 200) { proxyUrl = s3Url; }
    else {
      try {
        var decipher = crypto.createDecipher('aes-256-cbc', config.privateKey);
        proxyUrl = decipher.update(options, 'hex', 'utf8');
        proxyUrl += decipher.final('utf8');
      }
      catch(err) { return reply(Hapi.error.badRequest()); }
    }

    return reply.proxy({ uri: proxyUrl, passThrough: true });
  });
};

var handleUpload = function(options, reply) {
  var s3Url = createS3Url(options);
  reply.proxy({ uri: s3Url, passThrough: true });
};
