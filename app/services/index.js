angular.module('ept')
  .factory('Auth', require('./auth'))
  .factory('Session', require('./session'))
  .factory('User', require('./user'));
