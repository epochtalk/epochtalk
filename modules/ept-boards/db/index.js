var path = require('path');

module.exports = {
  all: require(path.normalize(__dirname + '/all')),
  allSelect: require(path.normalize(__dirname + '/allSelect')),
  create: require(path.normalize(__dirname + '/create')),
  update: require(path.normalize(__dirname + '/update')),
  breadcrumb: require(path.normalize(__dirname + '/breadcrumb')),
  find: require(path.normalize(__dirname + '/find')),
  updateAll: require(path.normalize(__dirname + '/updateAll')),
  allCategories: require(path.normalize(__dirname + '/allCategories')),
  getBoardInBoardMapping: require(path.normalize(__dirname + '/getBoardInBoardMapping')),
  getBoardWriteAccess: require(path.normalize(__dirname + '/getBoardWriteAccess')),
  delete: require(path.normalize(__dirname + '/delete'))
};
