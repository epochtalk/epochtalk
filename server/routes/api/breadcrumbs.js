var breadcrumbs = require(__dirname + '/configs/breadcrumbs');

module.exports = [
  // GET BREADCRUMBS
  { method: 'GET', path: '/breadcrumbs', config: breadcrumbs.byType }
];