var path = require('path');

module.exports = [
  require(path.normalize(__dirname + '/get')),
  require(path.normalize(__dirname + '/update'))
];
