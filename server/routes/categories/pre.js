var path = require('path');
var sanitizer = require(path.join('..', '..', '..', 'sanitizer'));

module.exports = {
  clean: function(request, reply) {
    request.payload.name = sanitizer.strip(request.payload.name);
    return reply();
  }
};
