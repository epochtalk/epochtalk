var path = require('path');

module.exports = {
  create: require(path.normalize(__dirname + '/create')),
  get: require(path.normalize(__dirname + '/get')),
  getPublic: require(path.normalize(__dirname + '/getPublic')),
  update: require(path.normalize(__dirname + '/update'))
};
