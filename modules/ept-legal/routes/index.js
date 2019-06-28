var path = require('path');

module.exports = [
  require(path.normalize(__dirname + '/legal')),
  require(path.normalize(__dirname + '/reset')),
  require(path.normalize(__dirname + '/text')),
  require(path.normalize(__dirname + '/update'))
];
