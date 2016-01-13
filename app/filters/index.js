angular.module('ept')
  .filter('decode', require('./decode.js'))
  .filter('humanDate', require('./human-date.js'))
  .filter('replace', require('./replace.js'))
  .filter('truncate', require('./truncate.js'));
