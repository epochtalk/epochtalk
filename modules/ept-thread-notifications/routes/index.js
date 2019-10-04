var path = require('path');

module.exports = [
  require(path.join(__dirname, 'get-notification-settings')),
  require(path.join(__dirname, 'enable-notifications')),
  require(path.join(__dirname, 'remove-subscriptions'))
];
