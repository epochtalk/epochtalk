var path = require('path');

module.exports = [
  require(path.normalize(__dirname + '/update')),
  require(path.normalize(__dirname + '/find')),
  require(path.normalize(__dirname + '/meta-find')),
  require(path.normalize(__dirname + '/pagePublic')),
  require(path.normalize(__dirname + '/deactivate')),
  require(path.normalize(__dirname + '/reactivate')),
  require(path.normalize(__dirname + '/delete')),
  require(path.normalize(__dirname + '/adminRecover')),
  require(path.normalize(__dirname + '/page')),
  require(path.normalize(__dirname + '/count')),
  require(path.normalize(__dirname + '/addRoles')),
  require(path.normalize(__dirname + '/removeRole')),
  require(path.normalize(__dirname + '/searchUsernames')),
  require(path.normalize(__dirname + '/preferences'))
];
