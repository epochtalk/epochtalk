var path = require('path');

module.exports = [
  require(path.normalize(__dirname + '/getTheme')),
  require(path.normalize(__dirname + '/previewTheme')),
  require(path.normalize(__dirname + '/resetTheme')),
  require(path.normalize(__dirname + '/setTheme'))
];
