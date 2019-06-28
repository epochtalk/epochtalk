var route = ['$stateProvider', function($stateProvider) {
  $stateProvider.state('settings', {
    url: '/settings',
    parent: 'public-layout',
    views: {
      'content': {
        controller: 'SettingsCtrl',
        controllerAs: 'SettingsCtrl',
        template: require('./settings.html')
      }
    },
    resolve: {
      $title: [function() { return 'Settings'; }],
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('./settings.controller');
          $ocLazyLoad.load({ name: 'ept.settings.ctrl' });
          deferred.resolve(ctrl);
        });
        return deferred.promise;
      }],
      user: ['User', 'Session', '$q', function(User, Session, $q) {
        if (Session.isAuthenticated()) {
          return User.get({ id: Session.user.username }).$promise;
        }
        else { return $q.reject({ status: 401, statusText: 'Unauthorized' }); }
      }],
    }
  });
}];

module.exports = angular.module('ept.settings', ['ui.router'])
.config(route)
.name;
