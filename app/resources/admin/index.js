angular.module('ept')
  .factory('AdminReports', require('./reports.js'))
  .factory('AdminSettings', require('./settings.js'))
  .factory('AdminUsers', require('./users.js'));
