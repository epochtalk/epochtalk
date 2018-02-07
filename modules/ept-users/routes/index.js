var path = require('path');

module.exports = [
  require(path.normalize(__dirname + '/update')),
  require(path.normalize(__dirname + '/find')),
  require(path.normalize(__dirname + '/meta-find')),
  require(path.normalize(__dirname + '/pagePublic')),
  require(path.normalize(__dirname + '/deactivate')),
  require(path.normalize(__dirname + '/reactivate')),
  require(path.normalize(__dirname + '/delete')),
  require(path.normalize(__dirname + '/invitations')),
  require(path.normalize(__dirname + '/invite')),
  require(path.normalize(__dirname + '/removeInvitation')),
  require(path.normalize(__dirname + '/hasInvitation')),
  require(path.normalize(__dirname + '/resend')),
  require(path.normalize(__dirname + '/preferences'))
];
