var path = require('path');
var imageStore = require(path.normalize(__dirname + '/../../../images'));

module.exports = {
  handleImages: function(request, reply) {
    // clear the expiration on logo/favicon
    if (request.payload.website.logo) {
      imageStore.clearExpiration(request.payload.website.logo);
    }
    if (request.payload.website.favicon) {
      imageStore.clearExpiration(request.payload.website.favicon);
    }
    return reply();
  }
};
