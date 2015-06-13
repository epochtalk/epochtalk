var path = require('path');
var settings = require(path.normalize(__dirname + '/config'));

module.exports = [
  { method: 'GET', path: '/settings/web', config: settings.webConfigs },
];
