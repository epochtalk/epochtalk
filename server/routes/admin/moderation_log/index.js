var path = require('path');
var moderationLog = require(path.normalize(__dirname + '/config'));

module.exports = [
  { method: 'GET', path: '/modlog', config: moderationLog.page }
];
