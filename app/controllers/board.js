module.exports = ['$scope', '$http', '$routeParams',
  function($scope, $http, $routeParams) {
    var boardId = $routeParams.boardId;
    $http.get('/api/boards/' + boardId).success(function(board) {
      $scope.board = board;
    });

    $http.get('/api/threads?board_id=' + boardId).success(function(threads) {
      $scope.threads = threads;
    });
  }
];
