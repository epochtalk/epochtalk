var route = ['$stateProvider', function($stateProvider) {
  $stateProvider.state('search-posts', {
    url: '/search/posts?search&page&limit',
    parent: 'public-layout',
    reloadOnSearch: false,
    views: {
      'content': {
        controller: 'PostSearchCtrl',
        controllerAs: 'PostSearchCtrl',
        template: require('./search.html')
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

module.exports = angular.module('ept.posts-search', ['ui.router'])
.config(route)
.name;
