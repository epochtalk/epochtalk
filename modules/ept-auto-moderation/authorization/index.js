var path = require('path');

module.exports = [
  {
    name: 'auth.autoModeration.addRule',
    method: require(path.normalize(__dirname + '/addRule'))
  },
  {
    name: 'auth.autoModeration.editRule',
    method: require(path.normalize(__dirname + '/editRule'))
  },
  {
    name: 'auth.autoModeration.removeRule',
    method: require(path.normalize(__dirname + '/removeRule'))
  },
  {
    name: 'auth.autoModeration.rules',
    method: require(path.normalize(__dirname + '/rules'))
  }
];
