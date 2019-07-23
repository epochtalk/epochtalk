var path = require('path');
var images = require(path.normalize(__dirname + '/images'));

exports.register = function(server, options, next) {
  images.init(options);

  // imageStore decoration
  server.decorate('request', 'imageStore', images);
  server.decorate('server', 'imageStore', images);

  return next();
};

exports.register.attributes = {
  name: 'imageStore',
  version: '1.0.0'
};
