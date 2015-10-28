module.exports = ['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  // Checks if user is an admin
  var adminCheck = function(route) {
    return ['$q', 'Session', function($q, Session) {
      if (!Session.isAuthenticated()) {  return $q.reject({ status: 401, statusText: 'Unauthorized' }); }
      if (route && Session.hasPermission('adminAccess' + '.' + route)) { return true; }
      else if (!route && Session.hasPermission('adminAccess')) { return true; }
      else { return $q.reject({ status: 403, statusText: 'Forbidden' }); }
    }];
  };

  var adminSettingsRedirect = ['$state', 'Session', function($state, Session) {
    if (Session.hasPermission('adminAccess.settings.general')) { $state.go('admin-settings.general'); }
    else if (Session.hasPermission('adminAccess.settings.forum')) { $state.go('admin-settings.forum'); }
    else { $state.go('admin'); }
  }];

  $urlRouterProvider.when('/admin/settings', adminSettingsRedirect);
  $urlRouterProvider.when('/admin/settings/', adminSettingsRedirect);

  $stateProvider.state('admin-settings', {
    url: '/admin/settings',
    parent: 'admin-layout',
    views: {
      'content': {
        controller: ['$scope', 'Session', function($scope, Session) {
          this.hasPermission = Session.hasPermission;
          this.tab = null;
          if (Session.hasPermission('adminAccess.settings.general')) { this.tab = 'general'; }
          else if (Session.hasPermission('adminAccess.settings.forum')) { this.tab = 'users'; }
          $scope.child = {};
        }],
        controllerAs: 'AdminSettingsCtrl',
        templateUrl: '/static/templates/admin/settings/index.html'
      }
    },
    resolve: {
      userAccess: adminCheck(),
      settings: ['AdminSettings', function(AdminSettings) {
        return AdminSettings.get().$promise
        .then(function(settings) {
          // Remove unsettable configs
          delete settings.db;
          delete settings.rootDir;
          return settings;
        });
      }]
    }
  })
  .state('admin-settings.general', {
    url: '/general',
    views: {
      'data@admin-settings': {
        controller: 'GeneralSettingsCtrl',
        controllerAs: 'AdminSettingsCtrl',
        templateUrl: '/static/templates/admin/settings/general.html'
      }
    },
    resolve: {
      userAccess: adminCheck('settings.general'),
      $title: function() { return 'General Settings'; },
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('./general.controller');
          $ocLazyLoad.load({ name: 'ept.admin.settings.general.ctrl' });
          deferred.resolve(ctrl);
        });
        return deferred.promise;
      }],
    }
  })
  .state('admin-settings.forum', {
    url: '/forum',
    views: {
      'data@admin-settings': {
        controller: 'ForumSettingsCtrl',
        controllerAs: 'AdminSettingsCtrl',
        templateUrl: '/static/templates/admin/settings/forum.html'
      }
    },
    resolve: {
      userAccess: adminCheck('settings.forum'),
      $title: function() { return 'Forum Settings'; },
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('./forum.controller');
          $ocLazyLoad.load({ name: 'ept.admin.settings.forum.ctrl' });
          deferred.resolve(ctrl);
        });
        return deferred.promise;
      }],
    }
  });
}];
