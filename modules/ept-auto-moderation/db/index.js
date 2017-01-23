var path = require('path');

module.exports = {
  rules: require(path.normalize(__dirname + '/rules')),
  addRule: require(path.normalize(__dirname + '/addRule')),
  editRule: require(path.normalize(__dirname + '/editRule')),
  removeRule: require(path.normalize(__dirname + '/removeRule'))
};
