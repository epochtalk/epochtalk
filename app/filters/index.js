angular.module('ept')
  .filter('humanDate', require('./human-date.js'))
  .filter('replace', require('./replace.js'))
  .filter('truncate', require('./truncate.js'));