var path = require('path');
var sanitizer = require(path.join('..', '..', 'sanitizer'));
var config = require(path.join(__dirname, '..', '..', '..', 'config'));

module.exports = {
  clean: function(request, reply) {
    request.payload.name = sanitizer.strip(request.payload.name);
    return reply();
  }
};
