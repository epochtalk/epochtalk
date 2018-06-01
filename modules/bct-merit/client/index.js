var route = ['$stateProvider', function($stateProvider) {
  $stateProvider.state('merit', {
    parent: 'public-layout',
    url: '/profiles/{username}/merit',
    reloadOnSearch: false,
    views: {
      'content': {
        controller: 'UserMeritCtrl',
        controllerAs: 'UserMeritCtrl',
        templateUrl: '/static/templates/modules/bct-merit/user-merit.html'
      }
    },
    resolve: {
      $title: [ function() { return 'Merit'; } ],
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('./user-merit.controller');
          $ocLazyLoad.load({ name: 'bct.merit.ctrl' });
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
      statistics: ['$q', 'User', 'Merit', '$stateParams', function($q, User, Merit, $stateParams) {
        if ($stateParams.username) {
          return User.get({ id: $stateParams.username }).$promise
          .then(function(user) {
            return Merit.getUserStatistics({ userId: user.id }).$promise;
          });
        }
        else { return $q.reject({ status: 404, statusText: 'Not Found' }); }
      }]
    }
  });

}];

module.exports = angular.module('bct.merit', ['ui.router'])
.config(route)
.name;
