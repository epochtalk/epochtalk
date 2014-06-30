module.exports = ['$scope', '$http',
  function($scope, $http) {
    $http.get('/api/boards').success(function(boards) {
      $scope.boards = [];
      $scope.subBoards = {};
      boards.forEach(function(board) {
        if (board.parent_board_id) {
          if (!$scope.subBoards[board.parent_board_id]) {
            $scope.subBoards[board.parent_board_id] = [];
          }
          $scope.subBoards[board.parent_board_id].push(board);
        }
        else {
          $scope.boards.push(board);
        }
      });
    });
  }
];
