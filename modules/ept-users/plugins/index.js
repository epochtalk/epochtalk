var path = require('path');

module.exports = [
  { register: require(path.normalize(__dirname + '/last-active')) },
  {
    register: require(path.normalize(__dirname + '/track-ip')),
    db: true
  }
];
