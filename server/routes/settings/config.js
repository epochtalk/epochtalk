var path = require('path');
var config = require(path.normalize(__dirname + '/../../../config'));

exports.webConfigs = {
  auth: { mode: 'try', strategy: 'jwt' },
  handler: function(request, reply) {
    reply(config.website);
  }
};
