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
      $boardBanned: ['pageData', function(pageData) { return pageData.banned_from_board; }],
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          require('./posts.controller');
          $ocLazyLoad.load({ name: 'ept.posts.ctrl' });
          deferred.resolve();
        });
        return deferred.promise;
      }],
      loadParentCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          require('./parent.controller');
          $ocLazyLoad.load([
            { name: 'ept.posts.parentCtrl' },
            { name: 'ept.directives.poll-creator'},
            { name: 'ept.directives.poll-viewer'},
            { name: 'ept.directives.epochtalk-editor' },
            { name: 'ept.directives.image-uploader' },
            { name: 'ept.directives.resizeable' }
          ]);
          deferred.resolve();
        });
        return deferred.promise;
      }],
      pageData: ['Posts', 'Threads', 'PreferencesSvc', '$stateParams', '$location', function(Posts, Threads, PreferencesSvc, $stateParams, $location) {

        // If start is present page should not be present
        if ($stateParams.start && $stateParams.page) {
          delete $stateParams.page;
          $location.search('page', undefined);
        }

        var pref = PreferencesSvc.preferences;

        var query = {
          thread_id: $stateParams.threadId,
          page: $stateParams.page,
          limit: $stateParams.limit || pref.posts_per_page || 25,
          start: $stateParams.start
        };

        Threads.viewed({ id: $stateParams.threadId });
        return Posts.byThread(query).$promise;
      }]
    }
  })
  .state('search-posts', {
    url: '/search/posts?search&page&limit',
    parent: 'public-layout',
    reloadOnSearch: false,
    views: {
      'content': {
        controller: 'PostSearchCtrl',
        controllerAs: 'PostSearchCtrl',
        templateUrl: '/static/templates/posts/search.html'
      }
    },
    resolve: {
      $title: [function() { return 'Search Posts'; }],
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          require('./search.controller');
          $ocLazyLoad.load({ name: 'ept.postsearch.ctrl' });
          deferred.resolve();
        });
        return deferred.promise;
      }],
      pageData: ['Posts', '$stateParams', '$q', 'PreferencesSvc', function(Posts, $stateParams, $q, PreferencesSvc) {
        var pref = PreferencesSvc.preferences;

        return Posts.search({
          search: $stateParams.search,
          page: $stateParams.page,
          limit: $stateParams.limit || pref.posts_per_page || 25
        }).$promise
        .catch(function(err) { return $q.reject(err); });
      }]
    }
  });
}];

module.exports = angular.module('ept.posts', ['ui.router'])
.config(route)
.name;
