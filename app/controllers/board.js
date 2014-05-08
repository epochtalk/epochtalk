module.exports = function($scope, $http, $routeParams) {
  var boardId = $routeParams.boardId;
  $http.get('/api/boards/' + boardId).success(function(board) {
    $scope.board = board;
  });

  $http.get('/api/boards/' + boardId + '/threads')
  .success(function(threads) {
    $scope.threads = threads.rows;
    
    $scope.threads.forEach(function(thread) {
      console.log(thread._id);
      $http({
        method: 'GET',
        url: '/api/threads/' + thread._id + '/posts',
        params: {limit: 1}
      }).success(function(posts) {
        thread.latest_post = posts.rows[0];
      });
    });
  });
}

