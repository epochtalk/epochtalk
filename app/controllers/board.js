module.exports = ['$scope', '$http', '$routeParams', '$rootScope', 'breadcrumbs',
  function($scope, $http, $routeParams, $rootScope, breadcrumbs) {
    var boardId = $routeParams.boardId;
    $http.get('/api/boards/' + boardId).success(function(board) {
      $scope.board = board;
      breadcrumbs.options = { 'Board Name': board.name };
      $rootScope.breadcrumbs = breadcrumbs.get();
    });

    $http.get('/api/threads?board_id=' + boardId).success(function(threads) {
      // TODO: this needs to be grabbed from user settings
      var rowsPerPage = 10;
      threads.forEach(function(thread) {
        thread.page_count = Math.ceil(thread.post_count / rowsPerPage);
      });
      $scope.threads = threads;
    });

    $scope.range = function(n) {
      return new Array(n);
    };
  }
];
