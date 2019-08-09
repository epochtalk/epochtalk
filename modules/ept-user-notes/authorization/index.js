var path = require('path');

module.exports = [
  {
    name: 'auth.userNotes.create',
    method: require(path.normalize(__dirname + '/create'))
  },
  {
    name: 'auth.userNotes.delete',
    method: require(path.normalize(__dirname + '/delete'))
  },
  {
    name: 'auth.userNotes.page',
    method: require(path.normalize(__dirname + '/page'))
  },
  {
    name: 'auth.userNotes.update',
    method: require(path.normalize(__dirname + '/update'))
  }
];
