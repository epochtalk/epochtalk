var path = require('path');
var breadcrumbs = require(path.normalize(__dirname + '/config'));

module.exports = [
  { method: 'GET', path: '/breadcrumbs', config: breadcrumbs.byType }
];
