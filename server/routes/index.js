var path = require('path');
var crypto = require('crypto');
var imageProxy = require(path.join(__dirname, '..', 'images'));
var config = require(path.join(__dirname, '..', '..', 'config'));
var breadcrumbs = require(path.join(__dirname, 'breadcrumbs'));
var categories = require(path.join(__dirname,  'categories'));
var boards = require(path.join(__dirname, 'boards'));
var threads = require(path.join(__dirname, 'threads'));
var posts = require(path.join(__dirname, 'posts'));
var users = require(path.join(__dirname, 'users'));
var auth = require(path.join(__dirname,  'auth'));

function buildEndpoints() {
  return [].concat(breadcrumbs, categories, boards, threads, posts, users, auth);
}

exports.endpoints = function() {
  var localRoutes = [
    {
      method: 'GET',
      path: '/static/{path*}',
      handler: {
        directory: {
          path: path.join(__dirname, '..', '..', 'public'),
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
        auth: { strategy: 'jwt' },
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
          conditions.push(['content-length-range', 0, config.maxImageSize]);
          var policy = { expiration: expiration, conditions: conditions };
          policy = JSON.stringify(policy);
          policy = new Buffer(policy).toString('base64');

          // sign policy to generate signature
          var signature = crypto.createHmac('sha1', config.s3SecretKey).update(new Buffer(policy)).digest('base64');

          // generate image url
          var imageUrl = config.cdnUrl;
          if (imageUrl.indexOf('/', imageUrl.length-1) === -1) { imageUrl += '/'; }
          imageUrl += crypto.createHash('sha1').update('s3').digest('hex') + '/';
          imageUrl += filename;

          // add this imageUrl to the image proxy expiry
          imageProxy.setExpiration(config.imageExpiration, imageUrl);

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
  var apiRoutes = buildEndpoints();
  apiRoutes.forEach(function(route) {
    // prefix each route with api
    route.path = '/api' + route.path;
  });

  // add core routes
  var routes = localRoutes.concat(apiRoutes);
  return routes;
};
