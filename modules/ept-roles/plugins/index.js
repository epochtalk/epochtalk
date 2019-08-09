var path = require('path');

module.exports = [
  {
    plugin: require(path.normalize(__dirname + '/acls')),
    preload: true,
    db: true,
    config: true,
    permissions: true
  }
];
