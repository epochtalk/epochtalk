var path = require('path');

module.exports = {
  create: require(path.normalize(__dirname + '/create')),
  dismiss: require(path.normalize(__dirname + '/dismiss')),
  latest: require(path.normalize(__dirname + '/latest')),
  counts: require(path.normalize(__dirname + '/counts'))
};
