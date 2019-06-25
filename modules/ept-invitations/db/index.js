var path = require('path');

module.exports = {
  all: require(path.normalize(__dirname + '/all')),
  find: require(path.normalize(__dirname + '/find')),
  hasInvitation: require(path.normalize(__dirname + '/hasInvitation')),
  invite: require(path.normalize(__dirname + '/invite')),
  remove: require(path.normalize(__dirname + '/remove')),
  verify: require(path.normalize(__dirname + '/verify'))
};
