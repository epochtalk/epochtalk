var route = ['$stateProvider', function($stateProvider) {
  $stateProvider.state('newbie-patrol', {
    parent: 'public-layout',
    url: '/posts/patrol',
    reloadOnSearch: false,
    views: {
      'content': {
        controller: 'NewbieCtrl',
        controllerAs: 'NewbieCtrl',
        templateUrl: '/static/templates/modules/bct-patroller/newbie.html'
      }
    },
    resolve: {
      $title: function() { return 'Patrol Newbie Posts'; },
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          require('./newbie.controller');
          $ocLazyLoad.load({ name: 'bct.patroller.newbieCtrl' });
          deferred.resolve();
        });
        return deferred.promise;
      }],
      pageData: ['NewbiePatrol', function(NewbiePatrol) {
        return NewbiePatrol.publicNewbiePosts().$promise;
      }]
    }
  });
}];

module.exports = angular.module('bct.patroller', ['ui.router'])
.config(route)
.name;
