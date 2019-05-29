var path = require('path');

module.exports = [
  require(path.normalize(__dirname + '/addRule')),
  require(path.normalize(__dirname + '/all')),
  require(path.normalize(__dirname + '/deleteRule')),
  require(path.normalize(__dirname + '/updateRule'))
];
