var path = require('path');

module.exports = [
  {
    name: 'auth.moderators.add',
    method: require(path.normalize(__dirname + '/add')),
    options: { callback: false }
  },
  {
    name: 'auth.moderators.remove',
    method: require(path.normalize(__dirname + '/remove')),
    options: { callback: false }
  }
];
