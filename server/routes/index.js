var Joi = require('joi');
var Boom = require('boom');
var path = require('path');
var crypto = require('crypto');
var breadcrumbs = require(path.normalize(__dirname + '/breadcrumbs'));
var auth = require(path.normalize(__dirname + '/auth'));
var bans = require(path.normalize(__dirname + '/bans'));
var userNotes = require(path.normalize(__dirname + '/user_notes'));
var adminBoards = require(path.normalize(__dirname + '/admin/boards'));
var adminSettings = require(path.normalize(__dirname + '/admin/settings'));
var adminUsers = require(path.normalize(__dirname + '/admin/users'));
var adminRoles = require(path.normalize(__dirname + '/admin/roles'));
var adminModerators = require(path.normalize(__dirname + '/admin/moderators'));
var adminModerationLogs = require(path.normalize(__dirname + '/admin/moderation_logs'));
var notifications = require(path.normalize(__dirname + '/notifications'));

function buildEndpoints() {
  return [].concat(userNotes, bans, breadcrumbs, auth, notifications);
}

function buildAdminEndpoints() {
  return [].concat(adminBoards, adminSettings, adminUsers, adminRoles, adminModerators, adminModerationLogs);
}

exports.endpoints = function(internalConfig) {
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
    // favicon
    {
      method: 'GET',
      path: '/favicon.ico',
      handler: function(request, reply) {
        var config = request.server.app.config;
        var iconPath = config.website.favicon;
        if (!iconPath) { iconPath = path.join(__dirname, '../../public/favicon.ico'); }
        return reply.file(iconPath);
      }
    },
    // index page
    {
      method: 'GET',
      path: '/{path*}',
      handler: function(request, reply) {
        var config = request.server.app.config;
        var data = {
          title: config.website.title,
          description: config.website.description,
          keywords: config.website.keywords,
          logo: config.website.logo,
          websocket_host: config.websocket_client_host,
          websocket_port: config.websocket_port
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
        validate: { payload: Joi.array().items(Joi.string().required()).min(1) },
        handler: function(request, reply) {
          var filenames = request.payload;

          var policies = filenames.map(function(filename) {
            return request.imageStore.uploadPolicy(filename);
          });

          return reply(policies);
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
          maxBytes: internalConfig.images.maxSize,
          output: 'stream',
          parse: true
        },
        handler: function(request, reply) {
          // check we're using local storage
          var config = request.server.app.config;
          if (config.images.storage !== 'local') {
            return reply(Boom.notFound());
          }

          // make sure image file exists
          var file = request.payload.file;
          if (!file) { return reply(Boom.badRequest('No File Attached')); }

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
