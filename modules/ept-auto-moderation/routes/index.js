var path = require('path');

module.exports = [
  require(path.normalize(__dirname + '/rules')),
  require(path.normalize(__dirname + '/addRule')),
  require(path.normalize(__dirname + '/editRule')),
  require(path.normalize(__dirname + '/removeRule'))
];
