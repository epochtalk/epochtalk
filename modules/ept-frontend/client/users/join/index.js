var route = ['$stateProvider', function($stateProvider) {
  $stateProvider.state('join', {
    url: '/join?token&email',
    parent: 'public-layout',
    views: {
      'content': {
        controller: 'JoinCtrl',
        controllerAs: 'JoinCtrl',
        templateUrl:'/static/templates/users/join/join.html'
      }
    },
    resolve: {
      $title: [function() { return 'Join Us'; }],
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('./join.controller');
          $ocLazyLoad.load({ name: 'ept.join.ctrl' });
          deferred.resolve(ctrl);
        });
        return deferred.promise;
      }]
    }
  });
}];

module.exports = angular.module('ept.join', ['ui.router'])
.config(route)
.name;
