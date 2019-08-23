var path = require('path');

module.exports = [
  {
    name: 'auth.blacklist.addRule',
    method: require(path.normalize(__dirname + '/addRule'))
  },
  {
    name: 'auth.blacklist.all',
    method: require(path.normalize(__dirname + '/all'))
  },
  {
    name: 'auth.blacklist.deleteRule',
    method: require(path.normalize(__dirname + '/deleteRule'))
  },
  {
    name: 'auth.blacklist.updateRule',
    method: require(path.normalize(__dirname + '/updateRule'))
  }
];
