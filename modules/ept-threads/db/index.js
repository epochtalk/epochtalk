var path = require('path');

module.exports = {
  create: require(path.normalize(__dirname + '/create')),
  find: require(path.normalize(__dirname + '/find')),
  byBoard: require(path.normalize(__dirname + '/byBoard')),
  recent: require(path.normalize(__dirname + '/recent')),
  postedCount: require(path.normalize(__dirname + '/postedCount')),
  posted: require(path.normalize(__dirname + '/posted')),
  incViewCount: require(path.normalize(__dirname + '/incViewCount')),
  lock: require(path.normalize(__dirname + '/lock')),
  sticky: require(path.normalize(__dirname + '/sticky')),
  move: require(path.normalize(__dirname + '/move')),
  getThreadFirstPost: require(path.normalize(__dirname + '/getThreadFirstPost')),
  getThreadsBoardInBoardMapping: require(path.normalize(__dirname + '/getThreadsBoardInBoardMapping')),
  getBoardWriteAccess: require(path.normalize(__dirname + '/getBoardWriteAccess')),
  getThreadOwner: require(path.normalize(__dirname + '/getThreadOwner')),
  purge: require(path.normalize(__dirname + '/purge')),
  breadcrumb: require(path.normalize(__dirname + '/breadcrumb'))
};
