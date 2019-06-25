var path = require('path');

module.exports = [
  require(path.normalize(__dirname + '/create')),
  require(path.normalize(__dirname + '/find')),
  require(path.normalize(__dirname + '/update')),
  require(path.normalize(__dirname + '/delete')),
  require(path.normalize(__dirname + '/allCategories')),
  require(path.normalize(__dirname + '/allUnfiltered')),
  require(path.normalize(__dirname + '/allUncategorized')),
  require(path.normalize(__dirname + '/moveList')),
  require(path.normalize(__dirname + '/updateAll'))
];
