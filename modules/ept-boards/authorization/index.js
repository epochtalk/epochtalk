var path = require('path');

module.exports = [
  {
    name: 'auth.boards.find',
    method: require(path.normalize(__dirname + '/find')),
    options: { callback: false }
  },
  {
    name: 'auth.boards.allCategories',
    method: require(path.normalize(__dirname + '/allCategories')),
    options: { callback: false }
  },
  {
    name: 'auth.boards.allUnfiltered',
    method: require(path.normalize(__dirname + '/allUnfiltered')),
    options: { callback: false }
  },
  {
    name: 'auth.boards.allUncategorized',
    method: require(path.normalize(__dirname + '/allUncategorized')),
    options: { callback: false }
  },
  {
    name: 'auth.boards.create',
    method: require(path.normalize(__dirname + '/create')),
    options: { callback: false }
  },
  {
    name: 'auth.boards.delete',
    method: require(path.normalize(__dirname + '/delete')),
    options: { callback: false }
  },
  {
    name: 'auth.boards.update',
    method: require(path.normalize(__dirname + '/update')),
    options: { callback: false }
  }
];
