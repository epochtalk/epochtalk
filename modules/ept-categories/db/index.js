var path = require('path');

module.exports = {
  create: require(path.normalize(__dirname + '/create')),
  find: require(path.normalize(__dirname + '/find')),
  all: require(path.normalize(__dirname + '/all')),
  delete: require(path.normalize(__dirname + '/delete')),
};
