var path = require('path');

module.exports = {
  create: require(path.normalize(__dirname + '/create')),
  find: require(path.normalize(__dirname + '/find')),
  delete: require(path.normalize(__dirname + '/delete'))
};
