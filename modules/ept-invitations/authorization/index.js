var path = require('path');

module.exports = [
  {
    name: 'auth.invitations.all',
    method: require(path.normalize(__dirname + '/all'))
  },
  {
    name: 'auth.invitations.invite',
    method: require(path.normalize(__dirname + '/invite'))
  },
  {
    name: 'auth.invitations.remove',
    method: require(path.normalize(__dirname + '/remove'))
  },
  {
    name: 'auth.invitations.resend',
    method: require(path.normalize(__dirname + '/resend'))
  }
];
