require('angular/angular');
require('angular-cookies/angular-cookies');
require('angular-resource/angular-resource');
require('angular-route/angular-route');
require('angular-sanitize/angular-sanitize');

var app = angular.module('ept', [
  'ngRoute',
  'ngCookies',
  'ngResource',
  'ngSanitize'
]);


app.config(require('./config'));
app.controller('HeaderCtrl', require('./controllers/header'));

require('./css/normalize.css');
require('./css/foundation.css');
require('./css/style.css');
