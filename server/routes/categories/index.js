var path = require('path');
var categories = require(path.join(__dirname, 'config'));

// Export Routes/Pre
module.exports = [
  // CREATE CATEGORY
  { method: 'POST', path: '/categories', config: categories.create },
  // GET SINGLE CATEGORY
  { method: 'GET', path: '/categories/{id}', config: categories.find },
  // GET ALL CATEGORIES
  { method: 'GET', path: '/categories', config: categories.all },
  // POST IMPORT CATEGORY
  { method: 'POST', path: '/categories/import', config: categories.import }
];
