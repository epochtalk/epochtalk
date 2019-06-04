var path = require('path');

module.exports = [
  {
    register: require(path.normalize(__dirname + '/notifications')),
    db: true,
    websocket: true,
    config: true
  }
];
