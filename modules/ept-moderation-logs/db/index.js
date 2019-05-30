var path = require('path');

module.exports = {
  create: require(path.normalize(__dirname + '/create')),
  page: require(path.normalize(__dirname + '/page'))
};
