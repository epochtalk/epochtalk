var path = require('path');
var categories = require(path.normalize(__dirname + '/config'));

// Export Routes/Pre
module.exports = [
  { method: 'POST', path: '/categories', config: categories.create },
  { method: 'GET', path: '/categories/{id}', config: categories.find },
  { method: 'GET', path: '/categories', config: categories.all },
  { method: 'POST', path: '/categories/import', config: categories.import },
  { method: 'DELETE', path: '/categories/{id}', config: categories.delete }
];
