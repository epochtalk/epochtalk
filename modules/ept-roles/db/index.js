var path = require('path');

module.exports = {
  all: require(path.normalize(__dirname + '/all')),
  update: require(path.normalize(__dirname + '/update'))
};