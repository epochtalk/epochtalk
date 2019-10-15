var path = require('path');

module.exports = {
  add: require(path.normalize(__dirname + '/add')),
  getUsersBoards: require(path.normalize(__dirname + '/getUsersBoards')),
  isModerator: require(path.normalize(__dirname + '/isModerator')),
  isModeratorSelfModerated: require(path.normalize(__dirname + '/isModeratorSelfModerated')),
  isModeratorSelfModeratedThread: require(path.normalize(__dirname + '/isModeratorSelfModeratedThread')),
  isModeratorWithPostId: require(path.normalize(__dirname + '/isModeratorWithPostId')),
  isModeratorWithThreadId: require(path.normalize(__dirname + '/isModeratorWithThreadId')),
  remove: require(path.normalize(__dirname + '/remove'))
};
