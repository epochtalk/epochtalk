var path = require('path');
var routes = require(path.normalize(__dirname + '/routes'));

exports.register = function(server, opts, next) {
  opts = opts || {};

  server.route(routes);

  return next();
};

exports.register.attributes = {
  name: 'patroller',
  version: '1.0.0'
};
