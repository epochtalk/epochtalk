var config = require('../../config');
module.exports = function() {
  return { title: 'Host: ' + config.host };
}
