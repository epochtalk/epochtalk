angular.module('ept')
  .factory('Boards', require('./boards'))
  .factory('Threads', require('./threads'))
  .factory('Posts', require('./posts'))
  .factory('User', require('./user'));
