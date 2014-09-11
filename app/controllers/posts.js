var _ = require('lodash');
var fs = require('fs');

module.exports = ['$scope', '$location', '$routeParams', '$http', '$rootScope', '$templateCache', 'breadcrumbs',
  function($scope, $location, $routeParams, $http, $rootScope, $templateCache, breadcrumbs) {
    // Load pagination partial template into template cache
    var paginationTemplate = fs.readFileSync(__dirname + '/../templates/partials/pagination.html');
    $templateCache.put('partials/pagination.html', paginationTemplate);

    // TODO: this needs to be grabbed from user settings
    var limit = ($location.search()).limit;
    var postsPerPage = limit ? Number(limit) : 10;
    var threadId = $routeParams.threadId;
    var page = ($location.search()).page;
    $scope.page = page ? Number(page) : 1;
    $scope.posts = null;
    $scope.pageCount = 1;
    $scope.url = $location.path();
    // pagination

    $http({
      url: '/api/thread/',
      method: 'GET',
      params: {
        id: threadId
      }
    })
    .success(function(thread) {
      breadcrumbs.options = { 'Thread': thread.title };
      $rootScope.breadcrumbs = breadcrumbs.get();
      var postCount = thread.post_count;
      $scope.pageCount = Math.ceil(postCount / postsPerPage);
      $http({
        url: '/api/posts',
        method: 'GET',
        params: {
          thread_id: threadId,
          limit: postsPerPage,
          page: $scope.page
        }
      })
      .success(function(threadPosts) {
        $scope.posts = threadPosts;
      });
    });

    $scope.range = function(n) {
      return new Array(n);
    };

  }
];
