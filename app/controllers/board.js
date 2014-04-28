module.exports = function($scope, $http, $routeParams) {
  var boardId = $routeParams.boardId;
  $http.get('/api/boards/' + boardId).success(function(board) {
    $scope.board = board;
  });


}

