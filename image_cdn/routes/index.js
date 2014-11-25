/* jshint node: true */
'use strict';

var Hapi = require('hapi');
var req = require('request');
var crypto = require('crypto');
var path = require('path');
var config = require(path.join(__dirname, '..', 'config'));

exports.endpoints = function() {

  var routes = [
    {
      method: 'GET',
      path: '/images/{method}/{url}',
      config: {
        handler: function(request, reply) {
          var method = request.params.method;
          var url = request.params.url;

          // find method signature
          var hotlink = crypto.createHash('sha256').update('hotlink').digest('hex');
          var s3 = crypto.createHash('sha256').update('s3').digest('hex');
          
          // decode url
          var decodedUrl = '';
          try {
            var decipher = crypto.createDecipher('aes-256-cbc', config.privateKey);
            decodedUrl = decipher.update(url,'hex','utf8');
            decodedUrl += decipher.final('utf8');
          }
          catch(err) {
            // send error image
            return reply(Hapi.error.badRequest());
          }

          // figure out image method
          if (method === hotlink) {
            // pipe url back to requester
            return reply(req(decodedUrl));
          }
          else if (method === s3) {
            // pipe url back to requester
            return reply(Hapi.error.notFound());
          }
          else {
            return reply(Hapi.error.badRequest());
          }
        }
      }
    }
  ];

  // 404 route that goes to a page

  return routes;
};
