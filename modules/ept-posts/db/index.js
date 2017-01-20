var path = require('path');

module.exports = {
  create: require(path.normalize(__dirname + '/create')),
  update: require(path.normalize(__dirname + '/update')),
  find: require(path.normalize(__dirname + '/find')),
  byThread: require(path.normalize(__dirname + '/byThread')),
  pageByUserCount: require(path.normalize(__dirname + '/pageByUserCount')),
  pageByUser: require(path.normalize(__dirname + '/pageByUser')),
  delete: require(path.normalize(__dirname + '/delete')),
  undelete: require(path.normalize(__dirname + '/undelete')),
  lock: require(path.normalize(__dirname + '/lock')),
  search: require(path.normalize(__dirname + '/search')),
  unlock: require(path.normalize(__dirname + '/unlock')),
  purge: require(path.normalize(__dirname + '/purge')),
  getPostsThread: require(path.normalize(__dirname + '/getPostsThread')),
  getPostsBoardInBoardMapping: require(path.normalize(__dirname + '/getPostsBoardInBoardMapping')),
  getBoardWriteAccess: require(path.normalize(__dirname + '/getBoardWriteAccess')),
  getThreadFirstPost: require(path.normalize(__dirname + '/getThreadFirstPost')),
  isPostsThreadModerated: require(path.normalize(__dirname + '/isPostsThreadModerated')),
  isPostsThreadOwner: require(path.normalize(__dirname + '/isPostsThreadOwner'))
};
