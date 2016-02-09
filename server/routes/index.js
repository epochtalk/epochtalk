var Joi = require('joi');
var Boom = require('boom');
var path = require('path');
var crypto = require('crypto');
var config = require(path.normalize(__dirname + '/../../config'));
var breadcrumbs = require(path.normalize(__dirname + '/breadcrumbs'));
var categories = require(path.normalize(__dirname + '/categories'));
var boards = require(path.normalize(__dirname + '/boards'));
var threads = require(path.normalize(__dirname + '/threads'));
var posts = require(path.normalize(__dirname + '/posts'));
var users = require(path.normalize(__dirname + '/users'));
var auth = require(path.normalize(__dirname + '/auth'));
var reports = require(path.normalize(__dirname + '/reports'));
var adminBoards = require(path.normalize(__dirname + '/admin/boards'));
var adminSettings = require(path.normalize(__dirname + '/admin/settings'));
var adminUsers = require(path.normalize(__dirname + '/admin/users'));
var adminReports = require(path.normalize(__dirname + '/admin/reports'));
var adminRoles = require(path.normalize(__dirname + '/admin/roles'));
var adminModerators = require(path.normalize(__dirname + '/admin/moderators'));
var adminModerationLogs = require(path.normalize(__dirname + '/admin/moderation_logs'));
var conversations = require(path.normalize(__dirname + '/conversations'));
var messages = require(path.normalize(__dirname + '/messages'));
var watchlist = require(path.normalize(__dirname + '/watchlist'));

function buildEndpoints() {
  return [].concat(breadcrumbs, categories, boards, threads, posts, users, auth, reports, conversations, messages, watchlist);
}

function buildAdminEndpoints() {
  return [].concat(adminBoards, adminSettings, adminUsers, adminReports, adminRoles, adminModerators, adminModerationLogs);
}

exports.endpoints = function() {
  var localRoutes = [
    // static assets
    {
      method: 'GET',
      path: '/static/{path*}',
      handler: {
        directory: {
          path: path.join(__dirname, '..', '..', 'public')
        }
      }
    },
    // index page
    {
      method: 'GET',
      path: '/{path*}',
      handler: function(request, reply) {
        var data = {
          title: config.website.title,
          description: config.website.description,
          keywords: config.website.keywords,
          logo: config.website.logo,
          favicon: config.website.favicon
        };
        return reply.view('index', data);
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
          var result = request.imageStore.uploadPolicy(filename);
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
            return reply(Boom.notFound());
          }

          // make sure image file exists
          var file = request.payload.file;
          if (!file) { return reply(Boom.badRequest('No File Attached')); }
          file.on('end', function () { return reply().code(204); });

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

          request.imageStore.uploadImage(file, filename, reply);
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

  // namespace admin routes
  var apiAdminRoutes = buildAdminEndpoints();
  apiAdminRoutes.forEach(function(route) {
    route.path = '/api/admin' + route.path;
  });

  // add core routes
  var routes = localRoutes.concat(apiRoutes, apiAdminRoutes);
  return routes;
};
