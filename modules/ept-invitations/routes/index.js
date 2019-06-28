var path = require('path');

module.exports = [
  require(path.normalize(__dirname + '/all')),
  require(path.normalize(__dirname + '/hasInvitation')),
  require(path.normalize(__dirname + '/invite')),
  require(path.normalize(__dirname + '/inviteRegister')),
  require(path.normalize(__dirname + '/remove')),
  require(path.normalize(__dirname + '/resend')),
];
