var path = require('path');

module.exports = [
  {
    name: 'auth.roles.all',
    method: require(path.normalize(__dirname + '/all'))
  },
  {
    name: 'auth.roles.update',
    method: require(path.normalize(__dirname + '/update'))
  },
  {
    name: 'auth.roles.delete',
    method: require(path.normalize(__dirname + '/delete'))
  },
  {
    name: 'auth.roles.reprioritize',
    method: require(path.normalize(__dirname + '/reprioritize'))
  },
  {
    name: 'auth.roles.users',
    method: require(path.normalize(__dirname + '/users'))
  },
  {
    name: 'auth.roles.addRoles',
    method: require(path.normalize(__dirname + '/addRoles'))
  }
];
