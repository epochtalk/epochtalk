require('./admin');

angular.module('ept')
  .factory('Breadcrumbs', require('./breadcrumbs.js'))
  .factory('Notifications', require('./notifications.js'));
