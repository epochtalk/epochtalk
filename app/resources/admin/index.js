angular.module('ept')
  .factory('AdminBoards', require('./boards.js'))
  .factory('AdminReports', require('./reports.js'))
  .factory('AdminSettings', require('./settings.js'))
  .factory('AdminRoles', require('./roles.js'))
  .factory('AdminModerators', require('./moderators.js'))
  .factory('AdminUsers', require('./users.js'));
