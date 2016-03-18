require('./admin');

angular.module('ept')
  .factory('Breadcrumbs', require('./breadcrumbs.js'))
  .factory('Boards', require('./boards.js'))
  .factory('Categories', require('./categories.js'))
  .factory('Threads', require('./threads.js'))
  .factory('Reports', require('./reports.js'))
  .factory('Messages', require('./messages.js'))
  .factory('Conversations', require('./conversations.js'))
  .factory('Watchlist', require('./watchlist.js'))
  .factory('Notifications', require('./notifications.js'));
