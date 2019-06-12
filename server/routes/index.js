var Joi = require('joi');
var path = require('path');
var Boom = require('boom');
var path = require('path');
var fse = require('fs-extra');
var crypto = require('crypto');
var Promise = require('bluebird');
var adminLegal = require(path.normalize(__dirname + '/admin/legal'));
var adminUsers = require(path.normalize(__dirname + '/admin/users'));
var adminBoards = require(path.normalize(__dirname + '/admin/boards'));

function buildAdminEndpoints() {
  return [].concat(adminBoards, adminUsers, adminLegal);
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
          default_avatar: config.website.defaultAvatar,
          favicon: config.website.favicon,
          websocket_host: config.websocket_client_host,
          websocket_port: config.websocket_port,
          post_max_length: config.postMaxLength,
          max_image_size: internalConfig.images.maxSize,
          portal: { enabled: config.portal.enabled },
          GAKey: config.gaKey,
          currentYear: new Date().getFullYear()
        };
        return reply.view('index', data);
      }
    },
    // legal page
    {
      method: 'GET',
      path: '/legal',
      handler: function(request, reply) {
        var config = request.server.app.config;
        var baseCustomPath = __dirname + '/../../content/legal/';
        var baseDefaultPath = __dirname + '/../../defaults/legal/';

        var getFile = function(customDir, defaultDir) {
          return new Promise(function(resolve) {
            fse.stat(customDir, function(err, stat) {
              var readDir;
              if (!err && stat.isFile()) { readDir = customDir; }
              else { readDir = defaultDir; }
              return resolve(fse.readFileSync(readDir, 'utf8'));
            });
          });
        };

        var tosCustomDir = path.normalize(baseCustomPath + 'tos.txt');
        var tosDefaultDir = path.normalize(baseDefaultPath + 'tos.txt');
        var getTos = getFile(tosCustomDir, tosDefaultDir);

        var privacyCustomDir = path.normalize(baseCustomPath + 'privacy.txt');
        var privacyDefaultDir = path.normalize(baseDefaultPath + 'privacy.txt');
        var getPrivacy = getFile(privacyCustomDir, privacyDefaultDir);

        var disclaimerCustomDir = path.normalize(baseCustomPath + 'disclaimer.txt');
        var disclaimerDefaultDir = path.normalize(baseDefaultPath + 'disclaimer.txt');
        var getDisclaimer = getFile(disclaimerCustomDir, disclaimerDefaultDir);

        return Promise.join(getTos, getPrivacy, getDisclaimer, function(tos, privacy, disclaimer) {
          var data = {
            title: config.website.title,
            description: config.website.description,
            keywords: config.website.keywords,
            logo: config.website.logo,
            favicon: config.website.favicon,
            GAKey: config.gaKey,
            tos: tos,
            privacy: privacy,
            disclaimer: disclaimer
          };

          return reply.view('legal', data);
        });
      }
    }
  ];

  // namespace admin routes
  var apiAdminRoutes = buildAdminEndpoints();
  apiAdminRoutes.forEach(function(route) {
    route.path = '/api/admin' + route.path;
  });

  // add core routes
  var routes = localRoutes.concat(apiAdminRoutes);
  return routes;
};
