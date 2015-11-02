// Third Party Dependencies
window.jQuery = window.$ = require('jquery');
require('nestable');

// Angular Dependencies
require('angular');
require('ngResource');
require('ngSanitize');
require('ngAnimate');
require('uiRouter');
require('ngLoadingBar');
require('angularSortable');
require('ngTagsInput');

// Create Angular App
var app = angular.module('ept', [
  'ngResource',
  'ngSanitize',
  'ngAnimate',
  'ui.router',
  'angular-loading-bar',
  'angular-sortable-view',
  'ngTagsInput',
  require('oclazyload'),
  require('./layout/header.controller'),
  require('./boards'),
  require('./board'),
  require('./board/new-thread-index'),
  require('./messages'),
  require('./posts'),
  require('./user'),
  require('./user/confirm-index'),
  require('./user/reset-index'),
  require('./watchlist'),
  require('./admin')
]);

app.constant('USER_ROLES', {
  user: 'User',
  mod: 'Moderator',
  globalMod: 'Global Moderator',
  admin: 'Administrator',
  superAdmin: 'Super Administrator'
});

require('./filters');
require('./services');
require('./resources');
require('./components');

// Set Angular Configs
app
.config(require('./config'))
.run(['$rootScope', '$state', '$timeout', 'Auth', 'BreadcrumbSvc', 'USER_ROLES', function($rootScope, $state, $timeout, Auth, BreadcrumbSvc, USER_ROLES) {

  // Set ROLES to rootscope to be used in templates
  $rootScope.USER_ROLES = USER_ROLES;

  // Fetch website configs (title, logo, favicon)
  $rootScope.$webConfigs = forumData;

  // Dynamically populate breadcrumbs
  $rootScope.$on('$stateChangeSuccess', function() {
    // update title
    var title = $state.$current.locals.globals.$title;
    if (title) { $timeout(function() { $rootScope.$title = title; }); }
    // update breadcrumbs
    BreadcrumbSvc.update();
  });

  // Handle if there is an error changing state
  $rootScope.$on('$stateChangeError', function(event, next, nextParams, prev, prevParams, error) {
    event.preventDefault();

    // Unauthorized is redirected to login, save next so we can redirect after login
    if (error.status === 401 || error.statusText === 'Unauthorized') {
      $state.go('login');
      $state.next = next;
      $state.nextParams = nextParams;
    }
    // Forbidden redirect home
    else if (error.status === 403 || error.statusText === 'Forbidden' && next.name !== 'boards') { $state.go('boards'); }
    // Otherwise 404
    else { $state.go('404'); }
  });
}]);
