var path = require('path');

module.exports = {
  unread: require(path.normalize(__dirname + '/unread')),
  userWatchThreads: require(path.normalize(__dirname + '/userWatchThreads')),
  userWatchBoards: require(path.normalize(__dirname + '/userWatchBoards')),
  watchThread: require(path.normalize(__dirname + '/watchThread')),
  unwatchThread: require(path.normalize(__dirname + '/unwatchThread')),
  watchBoard: require(path.normalize(__dirname + '/watchBoard')),
  unwatchBoard: require(path.normalize(__dirname + '/unwatchBoard')),
  isWatchingBoard: require(path.normalize(__dirname + '/isWatchingBoard')),
  isWatchingThread: require(path.normalize(__dirname + '/isWatchingThread')),
};
