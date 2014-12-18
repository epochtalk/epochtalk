var path = require('path');
var sanitize = require(path.join('..', '..', 'sanitize'));

module.exports = {
  clean: function(request, reply) {
    request.payload.name = sanitize.strip(request.payload.name);
    return reply();
  }
};
