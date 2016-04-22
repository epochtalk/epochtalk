var path = require('path');
var userNotes = require(path.normalize(__dirname + '/config'));

// Export Routes/Pre
module.exports = [
  { method: 'GET', path: '/user/notes/{id}', config: userNotes.find },
  { method: 'GET', path: '/user/notes', config: userNotes.page },
  { method: 'POST', path: '/user/notes', config: userNotes.create },
  { method: 'PUT', path: '/user/notes', config: userNotes.update },
  { method: 'DELETE', path: '/user/notes', config: userNotes.delete }
];
