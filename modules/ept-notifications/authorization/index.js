var path = require('path');

module.exports = [
  {
    name: 'auth.notifications.counts',
    method: require(path.normalize(__dirname + '/counts')),
    options: { callback: false }
  },
  {
    name: 'auth.notifications.dismiss',
    method: require(path.normalize(__dirname + '/dismiss')),
    options: { callback: false }
  },
];
