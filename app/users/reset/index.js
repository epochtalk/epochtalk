var route = ['$stateProvider', function($stateProvider) {
  $stateProvider.state('reset', {
    url: '/reset/{username}/{token}',
    parent: 'public-layout',
    views: {
      'content': {
        controller: 'ResetCtrl',
        controllerAs: 'ResetCtrl',
        templateUrl:'/static/templates/users/reset/reset.html'
      }
    },
    resolve: {
      $title: ['$stateParams', function($stateParams) {
        return 'Reset Password ' + $stateParams.username;
      }],
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('./reset.controller');
          $ocLazyLoad.load({ name: 'ept.reset.ctrl' });
          deferred.resolve(ctrl);
        });
        return deferred.promise;
      }]
    }
  });
}];

module.exports = angular.module('ept.reset', ['ui.router'])
.config(route)
.name;
