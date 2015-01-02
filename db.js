var path = require('path');
var config = require(path.join(__dirname, 'config.json'));
if (config) {
  var options = {
    db: config.db || undefined
  };
}
module.exports = require('epoch-core-pg')(options);
