var path = require('path');
var settings = require(path.normalize(__dirname + '/config'));

module.exports = [
  { method: 'GET', path: '/settings', config: settings.find },
  { method: 'GET', path: '/settings/theme', config: settings.getTheme },
  { method: 'PUT', path: '/settings/theme', config: settings.setTheme },
  { method: 'PUT', path: '/settings/theme/preview', config: settings.previewTheme },
  { method: 'POST', path: '/settings/theme', config: settings.resetTheme },
  { method: 'POST', path: '/settings', config: settings.update }
];
