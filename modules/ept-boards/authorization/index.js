var path = require('path');

module.exports = [
  {
    name: 'auth.boards.find',
    method: require(path.normalize(__dirname + '/find'))
  },
  {
    name: 'auth.boards.allCategories',
    method: require(path.normalize(__dirname + '/allCategories'))
  },
  {
    name: 'auth.boards.allUnfiltered',
    method: require(path.normalize(__dirname + '/allUnfiltered'))
  },
  {
    name: 'auth.boards.allUncategorized',
    method: require(path.normalize(__dirname + '/allUncategorized'))
  },
  {
    name: 'auth.boards.create',
    method: require(path.normalize(__dirname + '/create'))
  },
  {
    name: 'auth.boards.delete',
    method: require(path.normalize(__dirname + '/delete'))
  },
  {
    name: 'auth.boards.update',
    method: require(path.normalize(__dirname + '/update'))
  },
  {
    name: 'auth.boards.updateAll',
    method: require(path.normalize(__dirname + '/updateAll'))
  },
  {
    name: 'auth.boards.moveList',
    method: require(path.normalize(__dirname + '/moveList'))
  }
];
