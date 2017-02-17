var Promise = require('bluebird');
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
      $boardBanned: ['pageData', function(pageData) { return pageData.bannedFromBoard; }],
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
      pageData: ['Posts', 'Threads', 'PreferencesSvc', '$stateParams', '$window', function(Posts, Threads, PreferencesSvc, $stateParams, $window) {
        var pref = PreferencesSvc.preferences;
        var query = {
          thread_id: $stateParams.threadId,
          page: $stateParams.page,
          limit: $stateParams.limit || pref.posts_per_page || 25,
          start: $stateParams.start
        };
        Threads.viewed({ id: $stateParams.threadId });
        return Posts.byThread(query).$promise
        .then(function(pageData) {
          return Promise.map(pageData.posts, function(post) {
            // run parsers on raw_body if post body is null
            if (post.body === '') {
              post.raw_body = post.raw_body.split('<br />').join('\n');
              return Promise.reduce($window.parsers, function(parsedBody, parser) {
                return parser.parse(parsedBody);
              }, post.raw_body)
              .then(function(parsedBody) {
                post.body = parsedBody;
                return post;
              });
            }
            else {
              return post;
            }
          })
          .then(function(mappedPosts) {
            pageData.posts = mappedPosts;
            return pageData;
          });
        });
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
