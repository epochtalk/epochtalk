// Dependencies
require('angular/angular');
require('angular-resource/angular-resource');
require('angular-route/angular-route');
require('angular-sanitize/angular-sanitize');
require('angular-ui-router');
// var Modernizr = require('foundation/js/vendor/modernizr');
jQuery = require('foundation/js/vendor/jquery');
$ = jQuery;
require('nestable/jquery.nestable');
require('foundation/js/vendor/fastclick');
require('foundation/js/vendor/placeholder');
require('foundation/js/foundation');

// Create Angular App
var app = angular.module('ept', [
  'ngRoute',
  'ngResource',
  'ngSanitize',
  'ui.router'
]);

// Register Forum Page Controllers
app.controller('AppCtrl', require('./controllers/app.js'));
app.controller('HeaderCtrl', require('./controllers/header.js'));
app.controller('BoardsCtrl', require('./controllers/boards.js'));
app.controller('BoardCtrl', require('./controllers/board.js'));
app.controller('NewThreadCtrl', require('./controllers/newThread.js'));
app.controller('PostsCtrl', require('./controllers/posts.js'));
app.controller('ProfileCtrl', require('./controllers/profile.js'));
app.controller('ResetCtrl', require('./controllers/reset.js'));
app.controller('ConfirmCtrl', require('./controllers/confirm.js'));

// Register Admin Page Controllers
app.controller('CategoriesCtrl', require('./controllers/admin/categories.js'));

// Register Directives
app.directive('epochtalkEditor', require('./directives/editor/editor.js'));
app.directive('pagination', require('./directives/pagination'));
app.directive('categoryEditor', require('./directives/category_editor'));
app.directive('modal', require('./directives/modal'));
app.directive('slideToggle', require('./directives/slide_toggle'));
app.directive('autoFocus', require('./directives/autofocus'));
app.directive('nestableBoards', require('./directives/category_editor/nestable-boards.js'));
app.directive('nestableCategories', require('./directives/category_editor/nestable-categories.js'));
app.directive('uniqueUsername', require('./directives/uniqueUsername'));
app.directive('uniqueEmail', require('./directives/uniqueEmail'));

// Set Angular Configs
app.config(require('./config'))
.run(['$rootScope', '$state', '$timeout', 'Auth', 'BreadcrumbSvc', function($rootScope, $state, $timeout, Auth, BreadcrumbSvc) {

  // Load foundation on view change
  $rootScope.$on('$viewContentLoaded', function() {
    $timeout(function() { $(document).foundation(); });
  });

  // Redirect users from protected routes
  // TODO: Add check to see if user is admin
  $rootScope.$on('$stateChangeStart', function (event, next) {
    if (next && next.protect) {
      var isAuthenticated = Auth.isAuthenticated();
      // Possibly redirect to login page in the future
      if (!isAuthenticated) { $timeout(function() { $state.go('boards'); }); }
    }
  });

  // Dynamically populate breadcrumbs
  $rootScope.$on('$stateChangeSuccess', function() {
    BreadcrumbSvc.update();
  });

}]);


// CSS Styles
var cssify = require('cssify');
require('./css/app.css');
cssify.byUrl('//netdna.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.css');
