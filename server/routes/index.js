/* jshint node: true */
'use strict';

// var qr = require('qr-image');
// app.get('/totp', function(req, res) {
//   var code = qr.image('otpauth://totp/epochtalk?secret=' + req.user.totp_key.base32, { type: 'svg' });
//   res.type('svg');
//   return code.pipe(res);
// });

var path = require('path');
var crypto = require('crypto');
var api = require(path.join(__dirname, 'api'));
var config = require(path.join(__dirname, '..', 'config'));

exports.endpoints = function() {
  // add local routes
  var localRoutes = [
    // static assets
    {
      method: 'GET',
      path: '/static/{path*}',
      handler: {
        directory: {
          path: path.join(__dirname, '../../public/'),
          index: false
        }
      }
    },
    // index page
    {
      method: 'GET',
      path: '/{path*}',
      handler: {
        file: 'index.html'
      }
    },
    // image upload policy
    {
      method: 'GET',
      path: '/policy/{filename}',
      config: {
        handler: function(request, reply) {
          // hash filename
          var filename = request.params.filename;
          filename = crypto.createHash('sha1')
          .update(filename)
          .update(Date.now().toString())
          .digest('hex');

          // build policy
          var expiration = new Date();
          expiration.setMinutes(expiration.getMinutes() + 5);
          expiration = expiration.toISOString();
          var conditions = [];
          conditions.push({bucket: 'epoch-dev'});
          conditions.push(['starts-with', '$key', 'images/' + filename]);
          conditions.push({'acl': 'public-read'});
          conditions.push(['starts-with', '$Content-Type', 'image']);
          conditions.push(["content-length-range", 0, config.maxImageSize]);
          var policy = { expiration: expiration, conditions: conditions };
          policy = JSON.stringify(policy);
          policy = new Buffer(policy).toString('base64');

          // sign policy to generate signature
          var signature = crypto.createHmac("sha1", config.s3SecretKey).update(new Buffer(policy)).digest("base64");

          // generate image url
          var imageUrl = config.cdnUrl;
          if (imageUrl.indexOf('/', imageUrl.length-1) === -1) { imageUrl += '/'; }
          imageUrl += crypto.createHash('sha1').update('s3').digest('hex') + '/';
          imageUrl += filename;

          return reply({
            policy: policy,
            signature: signature,
            accessKey: config.s3AccessKey,
            uploadUrl: config.bucketUrl,
            filename: filename,
            imageUrl: imageUrl
          });
        }
      }
    }
    // handle 404 in angular?
  ];

  // namespace core routes
  var apiRoutes = api.endpoints();
  apiRoutes.forEach(function(route) {
    // prefix each route with api
    route.path = '/api' + route.path;
  });

  // add core routes
  var routes = localRoutes.concat(apiRoutes);
  return routes;
};
