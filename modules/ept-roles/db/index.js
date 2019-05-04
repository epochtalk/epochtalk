var path = require('path');

module.exports = {
  create: require(path.normalize(__dirname + '/create')),
  all: require(path.normalize(__dirname + '/all')),
  update: require(path.normalize(__dirname + '/update')),
  delete: require(path.normalize(__dirname + '/delete')),
  reprioritize: require(path.normalize(__dirname + '/reprioritize'))
};
