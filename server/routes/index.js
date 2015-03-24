var Joi = require('joi');
var path = require('path');
var crypto = require('crypto');
var imagesValidator = require('epochtalk-validator').api.images;
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
      path: '/policy',
      config: {
        auth: { strategy: 'jwt' },
        validate: { payload: imagesValidator.schema.policy },
        handler: function(request, reply) {
          var filename = request.payload.filename;
          var result = images.uploadPolicy(filename);
          return reply(result);
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
