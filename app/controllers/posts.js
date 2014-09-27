module.exports = ['$scope', '$route', '$routeParams', '$http', '$rootScope', 'breadcrumbs', 'Auth',
  function($scope, $route, $routeParams, $http, $rootScope, breadcrumbs, Auth) {
    // TODO: this needs to be grabbed from user settings
    var threadId = $routeParams.threadId;
    var limit = $routeParams.limit;
    var postsPerPage = limit ? Number(limit) : 10;
    var page = $routeParams.page;
    $scope.page = page ? Number(page) : 1;
    $scope.posts = null;
    $scope.pageCount = 1;
    $scope.thread = {};
    $scope.loggedIn = Auth.isAuthenticated;

    $http({
      url: '/api/thread/',
      method: 'GET',
      params: { id: threadId }
    })
    .success(function(thread) {
      $scope.title = 'Re: ' + thread.title;
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

    $scope.title = '';
    $scope.encodedText = '';
    $scope.processedText = '';
    $scope.saveText = function(encoded, text) {
      $scope.encodedText = encoded;
      $scope.processedText = text;
    };
    $scope.savePost = function(post) {
      // save post to server
      $http({
        url: '/api/posts',
        method: 'POST',
        data: {
          title: $scope.title,
          encodedBody: $scope.encodedText,
          body: $scope.processedText,
          thread_id: threadId
        }
      })
      .success(function(data) { $route.reload();});
    };
  }
];
