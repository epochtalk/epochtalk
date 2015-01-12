var path = require('path');
var config = require(path.join(__dirname, 'config.json'));
if (!config) {
  process.exit(1);
}
module.exports = config;
