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
  require('./portal'),
  require('./boards'),
  // users
  require('./users/confirm'),
  require('./users/profile'),
  require('./users/reset'),
  require('./users/search'),
  require('./users/join'),
  // threads
  require('./threads/new'),
  require('./threads/posted'),
  require('./threads/threads'),
  // posts
  require('./posts'),
  require('./messages'),
  require('./patrol'),
  require('./admin')
].concat(moduleNames);
var app = angular.module('ept', ngDeps);

var resourceContext = require.context('./modules', true, /resource.js$/);
resourceContext.keys().forEach(function(args) { resourceContext(args); });

var directiveContext = require.context('./modules', true, /directive.js$/);
directiveContext.keys().forEach(function(args) { directiveContext(args); });

window.parsers = [];
var parserContext = require.context('./modules', true, /parser.js$/);
parserContext.keys().forEach(function(args) {
  window.parsers.push(parserContext(args));
});

require('./filters');
require('./services');
require('./resources');
require('./components');
require('./users/resource');
require('./boards/resource');
require('./threads/resource');
require('./posts/resource');
require('./patrol/resource');
require('./portal/resource');

// Set Angular Configs
app
.config(require('./config'))
.run(['$rootScope', '$state', '$timeout', 'Alert', 'BreadcrumbSvc', 'BanSvc', 'Websocket', function($rootScope, $state, $timeout, Alert, BreadcrumbSvc, BanSvc, Websocket) {

  // start the websocket connection on page load
  Websocket.init();

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

      // stop page change
      if (error === 'NoPageChange') { return; }

      // Unauthorized is redirected to login, save next so we can redirect after login
      if (error.status === 401) {
        $state.go('login');
        $state.next = next;
        $state.nextParams = nextParams;
      }
      // Forbidden
      else if (error.status === 403 && error.statusText === 'Forbidden') {
        $state.go('403');
        $state.next = next;
        $state.nextParams = nextParams;
      }
      // Too Many Requests
      else if (error.status === 429) { Alert.error('Too Many Requests'); }
      // logout from private board or thread (returns a 404)
      else if (error.status === 404 && (prev.name === 'threads.data' || prev.name === 'posts.data')) { $state.go('home'); }
      // 404 Not Found
      else if (error.status === 404 && (next.name === 'threads.data' || next.name === 'posts.data')) {
        $state.go('404');
        $state.next = next;
        $state.nextParams = nextParams;
      }
      // 404 catch all
      else if (error.status === 404) { $state.go('404'); }
      // 503 Service Unavailable
      else { $state.go('503'); }
  });
}]);
