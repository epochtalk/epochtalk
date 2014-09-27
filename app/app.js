// Dependencies
require('angular/angular');
require('angular-cookies/angular-cookies');
require('angular-resource/angular-resource');
require('angular-route/angular-route');
require('angular-sanitize/angular-sanitize');
require('ng-breadcrumb/ng-breadcrumbs');
// var Modernizr = require('foundation/js/vendor/modernizr');
jQuery = require('foundation/js/vendor/jquery');
$ = jQuery;
require('foundation/js/vendor/fastclick');
require('foundation/js/vendor/placeholder');
require('foundation/js/foundation');

// Create Angular App
var app = angular.module('ept', [
  'ng-breadcrumbs',
  'ngRoute',
  'ngCookies',
  'ngResource',
  'ngSanitize'
]);

// Register Controllers
app.controller('HeaderCtrl', require('./controllers/header'));
app.controller('MainCtrl', require('./controllers/main.js'));
app.controller('BoardsCtrl', require('./controllers/boards.js'));
app.controller('BoardCtrl', require('./controllers/board.js'));
app.controller('ThreadsCtrl', require('./controllers/threads.js'));
app.controller('ThreadCtrl', require('./controllers/thread.js'));
app.controller('PostsCtrl', require('./controllers/posts.js'));
app.controller('ProfileCtrl', require('./controllers/profile.js'));
app.controller('RegistrationCtrl', require('./controllers/registration.js'));

// add epochtalk-editor directive
app.directive('epochtalkEditor', require('./directives/editor/editor.js'));
app.directive('pagination', require('./directives/pagination'));

// Set Angular Configs
app.config(require('./config'))
.run(['$rootScope', function($rootScope) {
  $rootScope.$on('$viewContentLoaded', function() {
    $(document).foundation();
  });
}]);

// CSS Styles
require('./css/normalize.css');
require('./css/foundation.css');
require('./css/epochtalk.css');
require('./css/style.css');
require('./css/editor.css');
require('./css/medium-editor.css');
require('./css/default.css');
var cssify = require('cssify');
cssify.byUrl('//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css');
