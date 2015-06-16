var path = require('path');

var sanitizer = require(path.normalize(__dirname + '/../../sanitizer'));

module.exports = {
  clean: function(request, reply) {
    request.payload.name = sanitizer.strip(request.payload.name);
    if (request.payload.description) {
      request.payload.description = sanitizer.display(request.payload.description);
    }
    return reply();
  }
};
