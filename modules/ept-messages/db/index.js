var path = require('path');

module.exports = [
  { name: 'messages', data: require(path.normalize(__dirname + '/messages')) },
  { name: 'conversations', data: require(path.normalize(__dirname + '/conversations')) }
];
