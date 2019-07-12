var path = require('path');

module.exports = [
  {
    name: 'auth.messages.create',
    method: require(path.normalize(__dirname + '/createMessage'))
  },
  {
    name: 'auth.messages.latest',
    method: require(path.normalize(__dirname + '/latest'))
  },
  {
    name: 'auth.messages.delete',
    method: require(path.normalize(__dirname + '/deleteMessage'))
  },
  {
    name: 'auth.conversations.create',
    method: require(path.normalize(__dirname + '/createConversation'))
  },
  {
    name: 'auth.conversations.messages',
    method: require(path.normalize(__dirname + '/messages'))
  },
  {
    name: 'auth.conversations.delete',
    method: require(path.normalize(__dirname + '/deleteConversation'))
  },

];
