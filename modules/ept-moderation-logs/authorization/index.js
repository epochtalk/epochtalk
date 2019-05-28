var path = require('path');

module.exports = [
  {
    name: 'auth.moderationLogs.page',
    method: require(path.normalize(__dirname + '/page')),
    options: { callback: false }
  }
];
