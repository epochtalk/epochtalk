var path = require('path');

module.exports = [
  require(path.join(__dirname, 'enable-mention-emails')),
  require(path.join(__dirname, 'get-mention-email-settings')),
  require(path.join(__dirname, 'ignore-user')),
  require(path.join(__dirname, 'page')),
  require(path.join(__dirname, 'page-ignored-users')),
  require(path.join(__dirname, 'remove')),
  require(path.join(__dirname, 'unignore-user'))
];
