require('./admin');

angular.module('ept')
  .factory('Breadcrumbs', require('./breadcrumbs.js'))
  .factory('Boards', require('./boards.js'))
  .factory('Threads', require('./threads.js'))
  .factory('Posts', require('./posts.js'))
  .factory('User', require('./user.js'));
