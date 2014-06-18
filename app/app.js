// require('foundation/js/vendor/jquery');
// require('foundation/js/vendor/modernizr');
// require('foundation/js/foundation');
require('angular/angular.min');
require('angular-cookies/angular-cookies.min');
require('angular-resource/angular-resource.min');
require('angular-route/angular-route.min');
require('angular-sanitize/angular-sanitize.min');

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
