var path = require('path');

module.exports = [
  require(path.normalize(__dirname + '/create')),
  require(path.normalize(__dirname + '/find')),
  require(path.normalize(__dirname + '/pageByUser')),
  require(path.normalize(__dirname + '/byThread')),
  require(path.normalize(__dirname + '/meta-byThread')),
  require(path.normalize(__dirname + '/update')),
  require(path.normalize(__dirname + '/delete')),
  require(path.normalize(__dirname + '/undelete')),
  require(path.normalize(__dirname + '/lock')),
  require(path.normalize(__dirname + '/unlock')),
  require(path.normalize(__dirname + '/search')),
  require(path.normalize(__dirname + '/purge'))
];
