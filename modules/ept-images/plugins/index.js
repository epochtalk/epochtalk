var path = require('path');

module.exports = [
  { plugin: require(path.normalize(__dirname + '/imageStore')), db: true, config: true }
];
