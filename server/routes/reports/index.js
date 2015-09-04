var path = require('path');
var reports = require(path.normalize(__dirname + '/config'));

module.exports = [
  { method: 'POST', path: '/reports/users', config: reports.createUserReport },
  { method: 'POST', path: '/reports/posts', config: reports.createPostReport },
  { method: 'POST', path: '/reports/messages', config: reports.createMessageReport }
];
