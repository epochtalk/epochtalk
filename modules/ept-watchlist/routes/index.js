var path = require('path');

module.exports = [
  require(path.normalize(__dirname + '/unread')),
  require(path.normalize(__dirname + '/edit')),
  require(path.normalize(__dirname + '/pageThreads')),
  require(path.normalize(__dirname + '/pageBoards')),
  require(path.normalize(__dirname + '/watchThread')),
  require(path.normalize(__dirname + '/unwatchThread')),
  require(path.normalize(__dirname + '/watchBoard')),
  require(path.normalize(__dirname + '/unwatchBoard')),
];
