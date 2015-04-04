var Joi = require('joi');
var Boom = require('boom');
var path = require('path');
var crypto = require('crypto');
var images = require(path.normalize(__dirname + '/../images'));
var config = require(path.normalize(__dirname + '/../../config'));
var breadcrumbs = require(path.normalize(__dirname + '/breadcrumbs'));
var categories = require(path.normalize(__dirname + '/categories'));
var boards = require(path.normalize(__dirname + '/boards'));
var threads = require(path.normalize(__dirname + '/threads'));
var posts = require(path.normalize(__dirname + '/posts'));
var users = require(path.normalize(__dirname + '/users'));
var auth = require(path.normalize(__dirname + '/auth'));

function buildEndpoints() {
  return [].concat(breadcrumbs, categories, boards, threads, posts, users, auth);
}

exports.endpoints = function() {
  var localRoutes = [
    // static assets
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
      method: 'POST',
      path: '/images/policy',
      config: {
        auth: { strategy: 'jwt' },
        validate: { payload: { filename: Joi.string().required() } },
        handler: function(request, reply) {
          var filename = request.payload.filename;
          var storage = config.images.storage;
          var result = images[storage].uploadPolicy(filename);
          return reply(result);
        }
      }
    },
    // local image storage upload
    {
      method: 'POST',
      path: '/images/upload',
      config: {
        auth: { strategy: 'jwt' },
        payload: {
          maxBytes: config.images.maxSize,
          output: 'stream',
          parse: true
        },
        handler: function(request, reply) {
          // check we're using local storage
          if (config.images.storage !== 'local') {
            return reply(Boom.badRequest('This route is not is use'));
          }

          // make sure image file exists
          var file = request.payload.file;
          if (!file) { return reply(Boom.badRequest('No File Attached')); }
          file.on('end', function (err) { return reply().code(204); });

          // decode policy
          var policyPayload = request.payload.policy;
          var decipher = crypto.createDecipher('aes-256-ctr', config.privateKey);
          var decoded = decipher.update(policyPayload,'hex','utf8');
          decoded += decipher.final('utf8');

          // parse policy
          var policy;
          try { policy = JSON.parse(decoded); }
          catch(e) { return reply(Boom.badRequest('Malformed Policy')); }
          if (!policy) { return reply(Boom.badRequest('Malformed Policy')); }

          // check filename
          var filename = policy.filename;
          if (!filename) { return reply(Boom.badRequest('Invalid Policy')); }

          // check policy expiration
          var expiration = new Date(policy.expiration);
          if (expiration < Date.now()) {
            return reply(Boom.badRequest('Policy Timed Out'));
          }

          images.local.uploadImage(file, filename, reply);
        }
      }
    }
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
