var path = require('path');

module.exports = [
  {
    name: 'auth.users.update',
    method: require(path.normalize(__dirname + '/update')),
    options: { callback: false }
  },
  {
    name: 'auth.users.find',
    method: require(path.normalize(__dirname + '/find')),
    options: { callback: false }
  },
  {
    name: 'auth.users.metaFind',
    method: require(path.normalize(__dirname + '/metaFind')),
    options: { callback: false }
  },
  {
    name: 'auth.users.pagePublic',
    method: require(path.normalize(__dirname + '/pagePublic')),
    options: { callback: false }
  },
  {
    name: 'auth.users.deactivate',
    method: require(path.normalize(__dirname + '/deactivate')),
    options: { callback: false }
  },
  {
    name: 'auth.users.activate',
    method: require(path.normalize(__dirname + '/reactivate')),
    options: { callback: false }
  },
  {
    name: 'auth.users.delete',
    method: require(path.normalize(__dirname + '/delete')),
    options: { callback: false }
  },
  {
    name: 'auth.users.adminRecover',
    method: require(path.normalize(__dirname + '/adminRecover')),
    options: { callback: false }
  },
  {
    name: 'auth.users.page',
    method: require(path.normalize(__dirname + '/page')),
    options: { callback: false }
  },
  {
    name: 'auth.users.addRoles',
    method: require(path.normalize(__dirname + '/addRoles')),
    options: { callback: false }
  },
  {
    name: 'auth.users.removeRole',
    method: require(path.normalize(__dirname + '/removeRole')),
    options: { callback: false }
  },
  {
    name: 'auth.users.searchUsernames',
    method: require(path.normalize(__dirname + '/searchUsernames')),
    options: { callback: false }
  }
];
