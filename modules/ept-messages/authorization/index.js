var path = require('path');

module.exports = [
  {
    name: 'auth.messages.create',
    method: require(path.normalize(__dirname + '/createMessage')),
    options: { callback: false }
  },
  {
    name: 'auth.messages.latest',
    method: require(path.normalize(__dirname + '/latest')),
    options: { callback: false }
  },
  {
    name: 'auth.messages.delete',
    method: require(path.normalize(__dirname + '/deleteMessage')),
    options: { callback: false }
  },
  {
    name: 'auth.conversations.create',
    method: require(path.normalize(__dirname + '/createConversation')),
    options: { callback: false }
  },
  {
    name: 'auth.conversations.messages',
    method: require(path.normalize(__dirname + '/messages')),
    options: { callback: false }
  },
  {
    name: 'auth.conversations.delete',
    method: require(path.normalize(__dirname + '/deleteConversation')),
    options: { callback: false }
  },

];
