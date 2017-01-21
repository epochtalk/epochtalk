angular.module('ept')
  .factory('AdminBoards', require('./boards.js'))
  .factory('AdminModerationLogs', require('./moderation-logs.js'))
  .factory('AdminSettings', require('./settings.js'))
  .factory('AdminRoles', require('./roles.js'))
  .factory('AdminModerators', require('./moderators.js'))
  .factory('AdminUsers', require('./users.js'))
  .factory('AdminLegal', require('./legal.js'));
