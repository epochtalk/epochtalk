// Third Party Dependencies
window.jQuery = window.$ = require('jquery');
require('nestable');

// load Angular Dependencies
require('angular');
require('ngResource');
require('ngSanitize');
require('ngAnimate');
require('uiRouter');
require('ngLoadingBar');
require('angularSortable');
require('ngTagsInput');

// load all dynamic modules
var moduleNames = [];
var moduleContext = require.context('./modules', true, /index.js$/);
moduleContext.keys().forEach(function(args) {
  moduleNames.push(moduleContext(args));
});

// Create Angular App
var ngDeps = [
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
  require('./threads/new'),
  require('./threads/posted'),
  require('./messages'),
  require('./users/profile'),
  require('./users/confirm'),
  require('./users/reset'),
  require('./watchlist'),
  require('./admin')
].concat(moduleNames);
var app = angular.module('ept', ngDeps);

var resourceContext = require.context('./modules', true, /resource.js$/);
resourceContext.keys().forEach(function(args) { resourceContext(args); });

require('./filters');
require('./services');
require('./resources');
require('./components');

// Set Angular Configs
app
.config(require('./config'))
.run(['$rootScope', '$state', '$timeout', 'Alert', 'BreadcrumbSvc', 'BanSvc', function($rootScope, $state, $timeout, Alert, BreadcrumbSvc, BanSvc) {

  // Fetch website configs (title, logo, favicon)
  $rootScope.$webConfigs = forumData;

  // Dynamically populate breadcrumbs
  $rootScope.$on('$stateChangeSuccess', function() {
    // update title
    var title = $state.$current.locals.globals.$title;
    if (title) { $timeout(function() { $rootScope.$title = title; }); }
    // update breadcrumbs
    BreadcrumbSvc.update();
    // update banInfo
    BanSvc.update();
  });

  // Handle if there is an error changing state
  $rootScope.$on('$stateChangeError', function(event, next, nextParams, prev, prevParams, error) {
    event.preventDefault();

    console.log(error);

    // Unauthorized is redirected to login, save next so we can redirect after login
    if (error.status === 401 || error.statusText === 'Unauthorized') {
      $state.go('login');
      $state.next = next;
      $state.nextParams = nextParams;
    }
    // Forbidden redirect home
    else if (error.status === 403 || error.statusText === 'Forbidden' && next.name !== 'boards') { $state.go('boards'); }
    else if (error.status === 429) { Alert.error('Too Many Requests'); }
    // Otherwise 404
    else { $state.go('404'); }
  });
}]);
