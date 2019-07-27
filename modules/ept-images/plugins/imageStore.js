var path = require('path');
var images = require(path.normalize(__dirname + '/images'));

module.exports = {
  name: 'imageStore',
  version: '1.0.0',
  register: async function(server, options) {
    images.init(options);

    // imageStore decoration
    server.decorate('request', 'imageStore', images);
    server.decorate('server', 'imageStore', images);
  }
};
