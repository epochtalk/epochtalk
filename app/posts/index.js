var route = ['$stateProvider', function($stateProvider) {
  $stateProvider.state('posts', {
    parent: 'public-layout',
    reloadOnSearch: false,
    views: {
      'content': {
        controller: 'PostsParentCtrl',
        controllerAs: 'PostsParentCtrl',
        templateUrl: '/static/templates/posts/posts.html'
      }
    }
  })
  .state('posts.data', {
    url: '/threads/{threadId}/posts?limit&page&start',
    reloadOnSearch: false,
    views: {
      'data@posts': {
        controller: 'PostsCtrl',
        controllerAs: 'PostsCtrl',
        templateUrl: '/static/templates/posts/posts.data.html'
      }
    },
    resolve: {
      $title: ['pageData', function(pageData) { return pageData.thread.title; }],
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('./posts.controller');
          $ocLazyLoad.load({ name: 'ept.posts.ctrl' });
          deferred.resolve(ctrl);
        });
        return deferred.promise;
      }],
      loadParentCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          var ctrl = require('./parent.controller');
          $ocLazyLoad.load({ name: 'ept.posts.parentCtrl' });
          deferred.resolve(ctrl);
        });
        return deferred.promise;
      }],
      pageData: ['Posts', 'Threads', '$stateParams', function(Posts, Threads, $stateParams) {
        var query = {
          thread_id: $stateParams.threadId,
          page: $stateParams.page,
          limit: $stateParams.limit,
          start: $stateParams.start
        };
        Threads.viewed({ id: $stateParams.threadId });
        return Posts.byThread(query).$promise;
      }]
    }
  });
}];

module.exports = angular.module('ept.posts', ['ui.router'])
.config(route)
.name;
