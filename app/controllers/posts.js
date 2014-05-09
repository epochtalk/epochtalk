module.exports = function($scope, $routeParams, $http) {
  var rowsPerPage = 10;
  var threadId = $routeParams.threadId;
  $http.get('/api/threads/' + threadId + '/posts')
  .success(function(posts) {
    console.log(posts);
    $scope.page = (posts.offset / rowsPerPage) + 1;
    $scope.posts = posts;
  });

  $scope.paginateNext = function() {
    console.log($scope.posts.next_startkey);
    $http({
      url: '/api/threads/' + threadId + '/posts',
      method: 'GET',
      params: {
        startkey: $scope.posts.next_startkey,
        startkey_docid: $scope.posts.next_startkey_docid
      }
    })
    .success(function(posts) {
      console.log(posts);
      $scope.page = (posts.offset / rowsPerPage) + 1;
      $scope.posts = posts;
    });
  };

  $scope.paginatePrevAPI = function() {
    $http.get('/api/threads/' + threadId + '/posts?endkey_docid=' + $scope.posts.rows[0].id)
    .success(function(posts) {
      $scope.page = (posts.offset / rowsPerPage) + 1;
      $scope.posts = posts;
    });
  };
  
  $scope.paginatePrev = function() {
    $http({
      url: '/api/threads/' + threadId + '/posts',
      method: 'GET',
      params: {
        endkey: [$scope.posts.rows[0].thread_id, $scope.posts.rows[0].created_at],
        endkey_docid: $scope.posts.rows[0]._id
      }
    })
    .success(function(posts) {
      // console.log(posts);
      $scope.page = (posts.offset / rowsPerPage) + 1;
      $scope.posts = posts;
    });
  };
}
