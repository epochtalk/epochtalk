var path = require('path');
var boards = require(path.normalize(__dirname + '/config'));

module.exports = [
  { method: 'GET', path: '/boards/move', config: boards.moveBoards },
  { method: 'POST', path: '/categories', config: boards.updateCategories }
];
