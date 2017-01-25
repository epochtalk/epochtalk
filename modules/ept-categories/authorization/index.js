var path = require('path');

module.exports = [
  {
    name: 'auth.categories.create',
    method: require(path.normalize(__dirname + '/create')),
    options: { callback: false }
  },
  {
    name: 'auth.categories.find',
    method: require(path.normalize(__dirname + '/find')),
    options: { callback: false }
  },
  {
    name: 'auth.categories.all',
    method: require(path.normalize(__dirname + '/all')),
    options: { callback: false }
  },
  {
    name: 'auth.categories.delete',
    method: require(path.normalize(__dirname + '/delete')),
    options: { callback: false }
  }
];
