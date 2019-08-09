var path = require('path');

module.exports = [
  {
    name: 'auth.moderators.add',
    method: require(path.normalize(__dirname + '/add'))
  },
  {
    name: 'auth.moderators.remove',
    method: require(path.normalize(__dirname + '/remove'))
  }
];
