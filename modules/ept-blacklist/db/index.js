var path = require('path');

module.exports = {
  addRule: require(path.normalize(__dirname + '/addRule')),
  all: require(path.normalize(__dirname + '/all')),
  deleteRule: require(path.normalize(__dirname + '/deleteRule')),
  updateRule: require(path.normalize(__dirname + '/updateRule'))
};
