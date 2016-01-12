var route = ['$stateProvider', function($stateProvider) {
  $stateProvider.state('confirm', {
    url: '/confirm/{username}/{token}',
    parent: 'public-layout',
    views: {
      'content': {
        controller: 'ConfirmCtrl',
        controllerAs: 'ConfirmCtrl',
        templateUrl: '/static/templates/users/confirm/confirm.html'
      }
    },
    resolve: {
      $title: ['$stateParams', function($stateParams) {
        return 'Confirm Account ' + $stateParams.username;
      }],
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('./confirm.controller');
          $ocLazyLoad.load({ name: 'ept.confirm.ctrl' });
          deferred.resolve(ctrl);
        });
        return deferred.promise;
      }]
    }
  });
}];

module.exports = angular.module('ept.confirm', ['ui.router'])
.config(route)
.name;
