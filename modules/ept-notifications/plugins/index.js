var path = require('path');

module.exports = [
  {
    plugin: require(path.normalize(__dirname + '/notifications')),
    db: true,
    websocket: true,
    config: true
  }
];
