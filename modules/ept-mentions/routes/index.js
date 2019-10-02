var path = require('path');

module.exports = [
  page: require(path.join(__dirname, 'page')),
  remove: require(path.join(__dirname, 'remove')),
  pageIgnoredUsers: require(path.join(__dirname, 'page-ignored-users')),
  ignoreUser: require(path.join(__dirname, 'ignore-user')),
  unignoreUser: require(path.join(__dirname, 'unignore-user')),
  getMentionEmailSettings: require(path.join(__dirname, 'get-mention-email-settings')),
  enableMentionEmails: require(path.join(__dirname, 'enable-mention-emails'))
];
