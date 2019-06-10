var path = require('path');

module.exports = [
  require(path.normalize(__dirname + '/add')),
  require(path.normalize(__dirname + '/remove'))
];
