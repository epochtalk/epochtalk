var path = require('path');
var conversations = require(path.normalize(__dirname + '/config'));

// Export Routes/Pre
module.exports = [
  { method: 'POST', path: '/conversations', config: conversations.create },
  { method: 'GET', path: '/conversations/{conversationId}', config: conversations.messages },
  { method: 'DELETE', path: '/conversations/{id}', config: conversations.delete }
];
