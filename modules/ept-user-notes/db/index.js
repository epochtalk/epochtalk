var path = require('path');

module.exports = {
  create: require(path.normalize(__dirname + '/create')),
  delete: require(path.normalize(__dirname + '/delete')),
  find: require(path.normalize(__dirname + '/find')),
  page: require(path.normalize(__dirname + '/page')),
  update: require(path.normalize(__dirname + '/update'))
};
