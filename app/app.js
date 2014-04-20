require('angular/angular');
require('angular-route/angular-route');
require('angular-sanitize/angular-sanitize');

angular.module('ept', ['ngRoute', 'ngSanitize'])
  .config(require('./routes'));

