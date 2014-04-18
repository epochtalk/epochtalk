require('angular/angular');
require('angular-route/angular-route');

angular.module('ept', ['ngRoute'])
  .config(require('./routes'));

