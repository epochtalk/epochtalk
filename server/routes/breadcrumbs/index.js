var path = require('path');
var breadcrumbs = require(path.join(__dirname, 'config'));

// Export Routes
module.exports = [
  { method: 'GET', path: '/breadcrumbs', config: breadcrumbs.byType }
];
