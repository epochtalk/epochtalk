angular.module('ept')
  .factory('AdminBoards', require('./boards.js'))
  .factory('AdminSettings', require('./settings.js'))
  .factory('AdminUsers', require('./users.js'))
  .factory('AdminLegal', require('./legal.js'));
