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
    name: 'auth.users.invitations',
    method: require(path.normalize(__dirname + '/invitations')),
    options: { callback: false }
  },
  {
    name: 'auth.users.invite',
    method: require(path.normalize(__dirname + '/invite')),
    options: { callback: false }
  },
  {
    name: 'auth.users.removeInvite',
    method: require(path.normalize(__dirname + '/removeInvite')),
    options: { callback: false }
  },
  {
    name: 'auth.users.adminRecover',
    method: require(path.normalize(__dirname + '/adminRecover')),
    options: { callback: false }
  },
  {
    name: 'auth.users.resend',
    method: require(path.normalize(__dirname + '/resend')),
    options: { callback: false }
  }
];
