angular.module('ept')
  .factory('Settings', require('./settings.js'))
  .factory('Breadcrumbs', require('./breadcrumbs.js'))
  .factory('Boards', require('./boards.js'))
  .factory('Threads', require('./threads.js'))
  .factory('Posts', require('./posts.js'))
  .factory('User', require('./user.js'));
