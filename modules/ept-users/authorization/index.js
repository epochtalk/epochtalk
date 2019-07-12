var path = require('path');

module.exports = [
  {
    name: 'auth.users.update',
    method: require(path.normalize(__dirname + '/update'))
  },
  {
    name: 'auth.users.find',
    method: require(path.normalize(__dirname + '/find'))
  },
  {
    name: 'auth.users.lookup',
    method: require(path.normalize(__dirname + '/lookup'))
  },
  {
    name: 'auth.users.metaFind',
    method: require(path.normalize(__dirname + '/metaFind'))
  },
  {
    name: 'auth.users.pagePublic',
    method: require(path.normalize(__dirname + '/pagePublic'))
  },
  {
    name: 'auth.users.deactivate',
    method: require(path.normalize(__dirname + '/deactivate'))
  },
  {
    name: 'auth.users.activate',
    method: require(path.normalize(__dirname + '/reactivate'))
  },
  {
    name: 'auth.users.delete',
    method: require(path.normalize(__dirname + '/delete'))
  },
  {
    name: 'auth.users.adminRecover',
    method: require(path.normalize(__dirname + '/adminRecover'))
  },
  {
    name: 'auth.users.page',
    method: require(path.normalize(__dirname + '/page'))
  },
  {
    name: 'auth.users.addRoles',
    method: require(path.normalize(__dirname + '/addRoles'))
  },
  {
    name: 'auth.users.removeRole',
    method: require(path.normalize(__dirname + '/removeRole'))
  },
  {
    name: 'auth.users.searchUsernames',
    method: require(path.normalize(__dirname + '/searchUsernames'))
  }
];
