var path = require('path');

module.exports = [
  require(path.normalize(__dirname + '/ignore')),
  require(path.normalize(__dirname + '/unignore')),
  require(path.normalize(__dirname + '/ignored'))
];
