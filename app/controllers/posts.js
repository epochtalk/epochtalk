module.exports = function($scope, $routeParams, $http, $location, $route) {
  var rowsPerPage = 10;
  var threadId = $routeParams.threadId;
  var loadPosts = function(nextStartKey, nextStartKeyDocId) {
    $http({
      url: '/api/threads/' + threadId + '/posts',
      method: 'GET',
      params: {
        startkey: nextStartKey,
        startkey_docid: nextStartKeyDocId
      }
    })
    .success(function(posts) {
      console.log(posts);
      $scope.posts = posts;
    });
  }

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
      $scope.posts = posts;
    });
  };


  $scope.paginateNext2 = function() {
    console.log($scope.posts.next_startkey);
    $location.path('/threads/' + threadId + '/posts')
    .search({
      startkey: $scope.posts.next_startkey,
      startkey_docid: $scope.posts.next_startkey_docid
    });
    $route.reload();
  };
  
  $scope.paginatePrev = function() {
    $http.get('/api/threads/' + threadId + '/posts?endkey_docid=' + $scope.posts.rows[0].id)
    .success(function(posts) {
      $scope.posts = posts;
    });
  };
  
  loadPosts($location.search().next_startkey, $location.search().next_startkey_docid);
}
