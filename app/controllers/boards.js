module.exports = ['$scope', '$http', '$rootScope', 'breadcrumbs',
  function($scope, $http, $rootScope, breadcrumbs) {
    $http.get('/api/boards').success(function(boards) {
      boards.forEach(function(board) {
        if (board.children && board.children.length > 0) {
          // append all children counts
          board.children.forEach(function(child) {
            board.post_count += Number(child.post_count);
            board.thread_count += Number(child.thread_count);
          });
        }
      });
      $scope.boards = boards;
      $rootScope.breadcrumbs = breadcrumbs.get();
    });
  }
];
