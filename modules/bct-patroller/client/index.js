var route = ['$stateProvider', function($stateProvider) {
  $stateProvider.state('patrol', {
    parent: 'public-layout',
    reloadOnSearch: false,
    views: {
      'content': {
        controller: 'PatrolParentCtrl',
        controllerAs: 'PatrolParentCtrl',
        templateUrl: '/static/templates/patrol/patrol.html'
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
        templateUrl: '/static/templates/patrol/patrol.data.html'
      }
    },
    resolve: {
      $title: function() { return 'Patrol'; },
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          require('./patrol.controller');
          $ocLazyLoad.load({ name: 'ept.patrol.ctrl' });
          deferred.resolve();
        });
        return deferred.promise;
      }],
      loadParentCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          require('./parent.controller');
          $ocLazyLoad.load([
            { name: 'ept.patrol.parentCtrl' },
            { name: 'ept.directives.epochtalk-editor' },
            { name: 'ept.directives.resizeable' },
            { name: 'ept.directives.image-uploader' }
          ]);
          deferred.resolve();
        });
        return deferred.promise;
      }],
      pageData: ['Patrol', '$stateParams', function(Patrol, $stateParams) {
        var query = {
          limit: Number($stateParams.limit) || 25,
          page: Number($stateParams.page) || 1
        };
        return Patrol.index(query).$promise;
      }]
    }
  });
}];

module.exports = angular.module('ept.patrol', ['ui.router'])
.config(route)
.name;
