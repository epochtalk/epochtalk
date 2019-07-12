var path = require('path');

module.exports = [
  { plugin: require(path.normalize(__dirname + '/moderation-log')), db: true }
];
