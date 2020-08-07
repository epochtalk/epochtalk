var route = ['$stateProvider', function($stateProvider) {
  $stateProvider.state('posts', {
    parent: 'public-layout',
    reloadOnSearch: false,
    views: {
      'content': {
        controller: 'PostsParentCtrl',
        controllerAs: 'PostsParentCtrl',
        template: require('./posts.html')
      }
    }
  })
  .state('posts.data', {
<<<<<<< HEAD
    url: '/threads/{threadId}/posts?limit&page&start&purged',
||||||| parent of fbccfeb7... refactor: modify ui router and controller for posts to use slugs
    url: '/threads/{threadId}/posts?limit&page&start&purged&slug',
=======
    url: '/threads/{slug}/posts?limit&page&start&purged',
>>>>>>> fbccfeb7... refactor: modify ui router and controller for posts to use slugs
    reloadOnSearch: false,
    views: {
      'data@posts': {
        controller: 'PostsCtrl',
        controllerAs: 'PostsCtrl',
        template: require('./posts.data.html')
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
      pageData: ['Posts', 'Threads', 'PreferencesSvc', '$stateParams', function(Posts, Threads, PreferencesSvc, $stateParams) {
        var pref = PreferencesSvc.preferences;

        var query = {
          slug: $stateParams.slug,
          page: $stateParams.page,
          limit: $stateParams.limit || pref.posts_per_page || 25,
          start: $stateParams.start
        };

        if (query.page && query.start) { delete query.page; }

        // Threads.viewed({ id: $stateParams.threadId });
        return Posts.byThread(query).$promise;
      }]
    }
  });
}];


module.exports = angular.module('ept.posts', ['ui.router'])
.config(route)
.name;
