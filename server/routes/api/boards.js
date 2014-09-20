var boards = require(__dirname + '/configs/boards');

module.exports = [
  // CREATE BOARD
  { method: 'POST', path: '/boards', config: boards.create },
  // GET SINGLE BOARD
  { method: 'GET', path: '/boards/{id}', config: boards.find },
  // GET ALL BOARDS
  { method: 'GET', path: '/boards/all', config: boards.all },
  // GET ALL BOARDS IN CATEGORY
  { method: 'GET', path: '/boards', config: boards.allCategories },
  // UPDATE BOARD
  { method: 'POST', path: '/boards/{id}', config: boards.update },
  // DELETE BOARD (should delete all threads?)
  { method: 'DELETE', path: '/boards/{id}', config: boards.delete },
];