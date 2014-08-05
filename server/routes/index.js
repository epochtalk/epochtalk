/* jshint node: true */
'use strict';

// var qr = require('qr-image');
// app.get('/totp', function(req, res) {
//   var code = qr.image('otpauth://totp/epochtalk?secret=' + req.user.totp_key.base32, { type: 'svg' });
//   res.type('svg');
//   return code.pipe(res);
// });

var path = require('path');
var api = require('epoch-api');

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
