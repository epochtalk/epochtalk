var path = require('path');

module.exports = {
  create: require(path.normalize(__dirname + '/create')),
  latest: require(path.normalize(__dirname + '/latest')),
  delete: require(path.normalize(__dirname + '/delete')),
  isMessageSender: require(path.normalize(__dirname + '/isMessageSender')),
  conversationCount: require(path.normalize(__dirname + '/conversationCount')),
  ignoreUser: require(path.normalize(__dirname + '/ignoreUser')),
  unignoreUser: require(path.normalize(__dirname + '/unignoreUser')),
  getUserIgnored: require(path.normalize(__dirname + '/getUserIgnored')),
  pageIgnoredUsers: require(path.normalize(__dirname + '/pageIgnoredUsers'))
};
