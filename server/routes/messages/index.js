var path = require('path');
var messages = require(path.normalize(__dirname + '/config'));

// Export Routes/Pre
module.exports = [
  { method: 'POST', path: '/messages', config: messages.create },
  { method: 'GET', path: '/messages', config: messages.latest },
  { method: 'GET', path: '/messages/users/{username}', config: messages.findUser },
  { method: 'DELETE', path: '/messages/{id}', config: messages.delete }
];
