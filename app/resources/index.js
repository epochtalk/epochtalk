require('./admin');

angular.module('ept')
  .factory('Breadcrumbs', require('./breadcrumbs.js'))
  .factory('Boards', require('./boards.js'))
  .factory('Categories', require('./categories.js'))
  .factory('Threads', require('./threads.js'))
  .factory('Posts', require('./posts.js'))
  .factory('Reports', require('./reports.js'))
  .factory('Settings', require('./settings.js'))
  .factory('User', require('./user.js'))
  .factory('Messages', require('./messages.js'))
  .factory('Conversations', require('./conversations.js'));
