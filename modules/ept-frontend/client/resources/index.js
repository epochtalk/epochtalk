require('./admin');

angular.module('ept')
  .factory('Breadcrumbs', require('./breadcrumbs.js'))
  .factory('Bans', require('./bans.js'))
  .factory('UserNotes', require('./user-notes.js'))
  .factory('Notifications', require('./notifications.js'))
  .factory('Invitations', require('./invitations.js'));
