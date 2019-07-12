var path = require('path');
var images = require(path.normalize(__dirname + '/common'));


module.exports = {
  name: 'imageStore',
  version: '1.0.0',
  register: async function(server, options) {
    images.init(options);

    // imageStore decoration
    server.decorate('request', 'imageStore', images);
    server.decorate('server', 'imageStore', images);

    server.method({
      name: 'common.images.sub',
      method: images.imageSub,
      options: { callback: false }
    });

    server.method({
      name: 'common.images.avatarSub',
      method: images.avatarSub,
      options: { callback: false }
    });
  }
};
