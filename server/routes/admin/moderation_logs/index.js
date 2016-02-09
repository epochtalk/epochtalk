var path = require('path');
var moderationLogs = require(path.normalize(__dirname + '/config'));

module.exports = [
  { method: 'GET', path: '/modlog', config: moderationLogs.page }
];
