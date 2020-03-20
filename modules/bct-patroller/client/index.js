var route = ['$stateProvider', function($stateProvider) {
  $stateProvider.state('patrol', {
    parent: 'public-layout',
    reloadOnSearch: false,
    views: {
      'content': {
        controller: 'PatrolParentCtrl',
        controllerAs: 'PatrolParentCtrl',
        template: require('./patrol.html')
      }
    }
  })
  .state('patrol.data', {
    url: '/patrol?limit&page',
    reloadOnSearch: false,
    views: {
      'data@patrol': {
        controller: 'PatrolCtrl',
        controllerAs: 'PatrolCtrl',
        template: require('./patrol.data.html')
      }
    },
    resolve: {
      $title: function() { return 'Patrol Posts'; },
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          require('./patrol.controller');
          $ocLazyLoad.load({ name: 'bct.patroller.ctrl' });
          deferred.resolve();
        });
        return deferred.promise;
      }],
      loadParentCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          require('./parent.controller');
          $ocLazyLoad.load([
            { name: 'bct.patroller.parentCtrl' },
            { name: 'ept.directives.epochtalk-editor' },
            { name: 'ept.directives.resizeable' },
            { name: 'ept.directives.image-uploader' }
          ]);
          deferred.resolve();
        });
        return deferred.promise;
      }],
      pageData: ['Patroller', '$stateParams', function(Patroller, $stateParams) {
        var query = {
          limit: Number($stateParams.limit) || 25,
          page: Number($stateParams.page) || 1
        };
        return Patroller.patrolPosts(query).$promise;
      }]
    }
  });
}];

module.exports = angular.module('bct.patroller', ['ui.router'])
.config(route)
.name;
