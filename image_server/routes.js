/* jshint node: true */
'use strict';

var Hapi = require('hapi');
var crypto = require('crypto');
var path = require('path');
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
        if (method === hotlink) {
          // decode options
          try {
            var decipher = crypto.createDecipher('aes-256-cbc', config.privateKey);
            var decodedUrl = decipher.update(options, 'hex', 'utf8');
            decodedUrl += decipher.final('utf8');
            // pipe url back to requester
            return reply.proxy({ uri: decodedUrl, passThrough: true });
          }
          catch(err) {
            // send error image
            return reply(Hapi.error.badRequest());
          }
        }
        else if (method === s3) {
          var bucketUrl = config.bucketUrl;
          if (bucketUrl.indexOf('/', bucketUrl.length-1) === -1) {
            bucketUrl += '/';
          }
          bucketUrl += 'images/';
          bucketUrl += options;
          return reply.proxy({ uri: bucketUrl, passThrough: true });
        }
        else { return reply(Hapi.error.badRequest()); }
      }
    }
  }
  // 404 routes?
];
