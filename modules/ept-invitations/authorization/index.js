var path = require('path');

module.exports = [
  {
    name: 'auth.invitations.all',
    method: require(path.normalize(__dirname + '/all')),
    options: { callback: false }
  },
  {
    name: 'auth.invitations.invite',
    method: require(path.normalize(__dirname + '/invite')),
    options: { callback: false }
  },
  {
    name: 'auth.invitations.remove',
    method: require(path.normalize(__dirname + '/remove')),
    options: { callback: false }
  },
  {
    name: 'auth.invitations.resend',
    method: require(path.normalize(__dirname + '/resend')),
    options: { callback: false }
  }
];
