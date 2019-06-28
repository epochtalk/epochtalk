var path = require('path');

module.exports = [
  {
    name: 'auth.userNotes.create',
    method: require(path.normalize(__dirname + '/create')),
    options: { callback: false }
  },
  {
    name: 'auth.userNotes.delete',
    method: require(path.normalize(__dirname + '/delete')),
    options: { callback: false }
  },
  {
    name: 'auth.userNotes.page',
    method: require(path.normalize(__dirname + '/page')),
    options: { callback: false }
  },
  {
    name: 'auth.userNotes.update',
    method: require(path.normalize(__dirname + '/update')),
    options: { callback: false }
  }
];
