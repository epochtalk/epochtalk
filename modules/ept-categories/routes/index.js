var path = require('path');

module.exports = [
  require(path.normalize(__dirname + '/create')),
  require(path.normalize(__dirname + '/find')),
  require(path.normalize(__dirname + '/all')),
  require(path.normalize(__dirname + '/delete')),
];
