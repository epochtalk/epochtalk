angular.module('ept')
  .filter('replace', require('./replace.js'))
  .filter('truncate', require('./truncate.js'));