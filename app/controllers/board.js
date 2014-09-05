module.exports = ['$scope', '$location', '$http', '$routeParams', '$rootScope', 'breadcrumbs',
  function($scope, $location, $http, $routeParams, $rootScope, breadcrumbs) {
    // TODO: this needs to be grabbed from user settings
    var threadsPerPage = 10;
    var boardId = $routeParams.boardId;
    var page = ($location.search()).page;
    $scope.page = page ? Number(page) : 1;
    $scope.threads = null;
    $scope.pageCount = 1;
    $scope.url = $location.path();

    $http.get('/api/boards/' + boardId)
    .success(function(board) {
      $scope.board = board;
      breadcrumbs.options = { 'Board Name': board.name };
      $rootScope.breadcrumbs = breadcrumbs.get();
      var threadCount = board.thread_count;
      $scope.pageCount = Math.ceil(threadCount / threadsPerPage);
      $http({
        url: '/api/threads',
        method: 'GET',
        params: {
          board_id: boardId,
          limit: threadsPerPage,
          page: $scope.page
        }
      })
      .success(function(threads) {
        // TODO: this needs to be grabbed from user settings
        var postsPerPage = 10;
        threads.forEach(function(thread) {
          thread.page_count = Math.ceil(thread.post_count / postsPerPage);
        });
        $scope.threads = threads;
      });
    });

    $scope.range = function(n) {
      return new Array(n);
    };
  }
];
