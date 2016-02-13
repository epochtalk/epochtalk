var path = require('path');
var notifications = require(path.normalize(__dirname + '/config'));

// Export Routes/Pre
module.exports = [
  { method: 'GET', path: '/notifications/counts', config: notifications.counts }
];
