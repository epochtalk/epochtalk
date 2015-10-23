module.exports = ['$stateProvider', function($stateProvider) {
  // Checks if user is an admin
  var adminCheck = function(route) {
    return ['$q', 'Session', function($q, Session) {
      if (!Session.isAuthenticated()) {  return $q.reject({ status: 401, statusText: 'Unauthorized' }); }
      if (route && Session.hasPermission('adminAccess' + '.' + route)) { return true; }
      else if (!route && Session.hasPermission('adminAccess')) { return true; }
      else { return $q.reject({ status: 403, statusText: 'Forbidden' }); }
    }];
  };

  $stateProvider.state('admin-analytics', {
    url: '/admin/analytics',
    parent: 'admin-layout',
    views: {
      'content': {
        controller: 'AnalyticsCtrl',
        controllerAs: 'AnalyticsCtrl',
        templateUrl: '/static/templates/admin/analytics/index.html'
      }
    },
    resolve: {
      userAccess: adminCheck('analytics'),
      $title: function() { return 'Analytics'; },
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('./analytics.controller');
          $ocLazyLoad.load({ name: 'ept.admin.analytics.ctrl' });
          deferred.resolve(ctrl);
        });
        return deferred.promise;
      }],
    }
  });
}];
