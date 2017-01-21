var route = ['$stateProvider', function($stateProvider) {
  $stateProvider.state('posted', {
    parent: 'public-layout',
    reloadOnSearch: false,
    views: {
      'content': {
        controller: [function(){}],
        controllerAs: 'PostedWrapperCtrl',
        templateUrl: '/static/templates/threads/posted/posted.html'
      }
    }
  })
  .state('posted.data', {
    url: '/threads/posted?limit&page',
    reloadOnSearch: false,
    views: {
      'data@posted': {
        controller: 'PostedCtrl',
        controllerAs: 'PostedCtrl',
        templateUrl: '/static/templates/threads/posted/posted.data.html'
      }
    },
    resolve: {
      $title: function() { return 'Threads Posted In'; },
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('./posted.controller');
          $ocLazyLoad.load({ name: 'ept.posted.ctrl' });
          deferred.resolve(ctrl);
        });
        return deferred.promise;
      }],
      pageData: ['Threads', '$stateParams', function(Threads, $stateParams) {
        var query = {
          limit: Number($stateParams.limit) || 25,
          page: Number($stateParams.page) || 1
        };
        return Threads.posted(query).$promise;
      }]
    }
  });
}];

module.exports = angular.module('ept.posted', ['ui.router'])
.config(route)
.name;
