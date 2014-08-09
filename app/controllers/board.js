module.exports = ['$scope', '$http', '$routeParams', '$rootScope', 'breadcrumbs',
  function($scope, $http, $routeParams, $rootScope, breadcrumbs) {
    var boardId = $routeParams.boardId;
    $http.get('/api/boards/' + boardId).success(function(board) {
      $scope.board = board;
      breadcrumbs.options = { 'Board Name': board.name };
      $rootScope.breadcrumbs = breadcrumbs.get();
    });

    $http.get('/api/threads?board_id=' + boardId).success(function(threads) {
      $scope.threads = threads;
    });
  }
];
