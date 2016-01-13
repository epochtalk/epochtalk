var path = require('path');
var boards = require(path.normalize(__dirname + '/config'));

module.exports = [
  { method: 'POST', path: '/boards', config: boards.create },
  { method: 'GET', path: '/boards/{id}', config: boards.find },
  { method: 'GET', path: '/boards', config: boards.allCategories },
  { method: 'GET', path: '/categoryboards', config: boards.byCategory },
  { method: 'POST', path: '/boards/{id}', config: boards.update },
  { method: 'DELETE', path: '/boards/{id}', config: boards.delete }
];
