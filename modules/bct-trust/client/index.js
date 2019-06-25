var route = ['$stateProvider', function($stateProvider) {
  $stateProvider.state('trust', {
    parent: 'public-layout',
    url: '/profiles/{username}/trust',
    reloadOnSearch: false,
    views: {
      'content': {
        controller: 'TrustCtrl',
        controllerAs: 'TrustCtrl',
        templateUrl: '/static/templates/modules/bct-trust/trust.html'
      }
    },
    resolve: {
      $title: [ function() { return 'Trust'; } ],
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('./trust.controller');
          $ocLazyLoad.load({ name: 'bct.trust.ctrl' });
          deferred.resolve(ctrl);
        });
        return deferred.promise;
      }],
      user: ['$q', 'User', '$stateParams', function($q, User, $stateParams) {
        if ($stateParams.username) {
          return User.get({ id: $stateParams.username }).$promise
          .then(function(user) { return user; });
        }
        else { return $q.reject({ status: 404, statusText: 'Not Found' }); }
      }],
      feedback: ['$q', 'UserTrust', '$stateParams', function($q, UserTrust, $stateParams) {
        if ($stateParams.username) {
          return UserTrust.getTrustFeedback({ username: $stateParams.username }).$promise
          .then(function(feedback) { return feedback; });
        }
        else { return $q.reject({ status: 404, statusText: 'Not Found' }); }
      }]
    }
  });

  $stateProvider.state('trust-settings', {
    parent: 'public-layout',
    url: '/settings/trust?hierarchy',
    reloadOnSearch: false,
    views: {
      'content': {
        controller: 'TrustSettingsCtrl',
        controllerAs: 'TrustSettingsCtrl',
        templateUrl: '/static/templates/modules/bct-trust/trustSettings.html'
      }
    },
    resolve: {
      $title: [ function() { return 'Trust Settings'; } ],
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('./trustSettings.controller');
          $ocLazyLoad.load([
            { name: 'bct.trustSettings.ctrl' }
          ]);
          deferred.resolve(ctrl);
        });
        return deferred.promise;
      }],
      trustTree: ['UserTrust', '$stateParams', function(UserTrust, $stateParams) {
        return UserTrust.getTrustTree({ hierarchy: $stateParams.hierarchy }).$promise
        .then(function(tree) { return tree; });
      }]
    }
  });
}];

module.exports = angular.module('bct.trust', ['ui.router'])
.config(route)
.name;
