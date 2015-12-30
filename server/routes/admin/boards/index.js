var path = require('path');
var boards = require(path.normalize(__dirname + '/config'));

module.exports = [
  { method: 'GET', path: '/categories', config: boards.categories },
  { method: 'GET', path: '/boards/move', config: boards.moveBoards },
  { method: 'GET', path: '/boards', config: boards.boards },
  { method: 'POST', path: '/categories', config: boards.updateCategories }
];
