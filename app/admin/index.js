var adminRoute = ['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  // Admin layout
  $stateProvider.state('admin-layout', {
    views: {
      'header': { templateUrl: '/static/templates/layout/header.admin.html' },
      'body': { templateUrl: '/static/templates/layout/admin-content.html' }
    }
  });

  // Checks if user is an admin
  var adminCheck = function(route) {
    return ['$q', 'Session', function($q, Session) {
      if (!Session.isAuthenticated()) {  return $q.reject({ status: 401, statusText: 'Unauthorized' }); }
      if (route && Session.hasPermission('adminAccess' + '.' + route)) { return true; }
      else if (!route && Session.hasPermission('adminAccess')) { return true; }
      else { return $q.reject({ status: 403, statusText: 'Forbidden' }); }
    }];
  };

  // Checks if user is a moderator
  var modCheck = function(route) {
    return ['$q', 'Session', function($q, Session) {
      if (!Session.isAuthenticated()) {  return $q.reject({ status: 401, statusText: 'Unauthorized' }); }
      if (route && Session.hasPermission('modAccess' + '.' + route)) { return true; }
      else if (!route && Session.hasPermission('modAccess')) { return true; }
      else { return $q.reject({ status: 403, statusText: 'Forbidden' }); }
    }];
  };

  var adminRedirect = ['$state', 'Session', function($state, Session) {
    if (Session.hasPermission('adminAccess.settings')) {
      if (Session.hasPermission('adminAccess.settings.general')) { $state.go('admin-settings.general'); }
      else if (Session.hasPermission('adminAccess.settings.forum')) { $state.go('admin-settings.forum'); }
      else if (Session.hasPermission('adminAccess.settings.theme')) { $state.go('admin-settings.theme'); }
      else { $state.go('boards'); }
    }
    else if (Session.hasPermission('adminAccess.management')) {
      if (Session.hasPermission('adminAccess.management.boards')) { $state.go('admin-management.boards'); }
      else if (Session.hasPermission('adminAccess.management.users')) { $state.go('admin-management.users'); }
      else if (Session.hasPermission('adminAccess.management.roles')) { $state.go('admin-management.roles'); }
      else { $state.go('boards'); }
    }
    else if (Session.hasPermission('modAccess')) {
      if (Session.hasPermission('modAccess.users')) {
        $state.go('admin-moderation.users', { filter: 'Pending'}, { location: true, reload: true });
      }
      else if (Session.hasPermission('modAccess.posts')) {
        $state.go('admin-moderation.posts', { filter: 'Pending'}, { location: true, reload: true });
      }
      else if (Session.hasPermission('modAccess.messages')) {
        $state.go('admin-moderation.messages', { filter: 'Pending'}, { location: true, reload: true });
      }
      else { $state.go('boards'); }
    }
    else { $state.go('boards'); }
  }];

  $urlRouterProvider.when('/admin', adminRedirect);
  $urlRouterProvider.when('/admin/', adminRedirect);

  $stateProvider.state('admin', {
    url: '/admin',
    parent: 'admin-layout',
    resolve: { userAccess: modCheck() || adminCheck() }
  });
}];

var adminSettingsRoutes = require('./settings');
var adminManagementRoutes = require('./management');
var adminModerationRoutes = require('./moderation');
var adminAnalyticsRoutes = require('./analytics');

module.exports = angular.module('ept.admin', ['ui.router'])
.config(adminRoute)
.config(adminSettingsRoutes)
.config(adminManagementRoutes)
.config(adminModerationRoutes)
.config(adminAnalyticsRoutes)
.name;
