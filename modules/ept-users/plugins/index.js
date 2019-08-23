var path = require('path');

module.exports = [
  { plugin: require(path.normalize(__dirname + '/last-active')) },
  {
    plugin: require(path.normalize(__dirname + '/track-ip')),
    db: true
  }
];
