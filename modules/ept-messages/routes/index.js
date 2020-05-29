var path = require('path');

module.exports = [
  require(path.normalize(__dirname + '/createConversation')),
  require(path.normalize(__dirname + '/createMessage')),
  require(path.normalize(__dirname + '/deleteConversation')),
  require(path.normalize(__dirname + '/deleteMessage')),
  require(path.normalize(__dirname + '/latest')),
  require(path.normalize(__dirname + '/messages')),
  require(path.normalize(__dirname + '/ignoreUser')),
  require(path.normalize(__dirname + '/unignoreUser')),
  require(path.normalize(__dirname + '/getMessageSettings')),
  require(path.normalize(__dirname + '/enableMessageEmails')),
  require(path.normalize(__dirname + '/enableNewbieMessages')),
  require(path.normalize(__dirname + '/pageIgnoredUsers'))
];
