var path = require('path');

module.exports = [
  {
    name: 'auth.roles.all',
    method: require(path.normalize(__dirname + '/all')),
    options: { callback: false }
  },
  {
    name: 'auth.roles.update',
    method: require(path.normalize(__dirname + '/update')),
    options: { callback: false }
  },
  {
    name: 'auth.roles.delete',
    method: require(path.normalize(__dirname + '/delete')),
    options: { callback: false }
  },
  {
    name: 'auth.roles.reprioritize',
    method: require(path.normalize(__dirname + '/reprioritize')),
    options: { callback: false }
  },
  {
    name: 'auth.roles.users',
    method: require(path.normalize(__dirname + '/users')),
    options: { callback: false }
  },
  {
    name: 'auth.roles.addRoles',
    method: require(path.normalize(__dirname + '/addRoles')),
    options: { callback: false }
  }
];
