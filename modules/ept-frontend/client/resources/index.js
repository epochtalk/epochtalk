require('./admin');

angular.module('ept')
  .factory('Breadcrumbs', require('./breadcrumbs.js'))
  .factory('Reports', require('./reports.js'))
  .factory('Messages', require('./messages.js'))
  .factory('Conversations', require('./conversations.js'))
  .factory('Bans', require('./bans.js'))
  .factory('UserNotes', require('./user-notes.js'))
  .factory('Notifications', require('./notifications.js'))
  .factory('Invitations', require('./invitations.js'));
