var fs = require('fs');

module.exports = ['$scope', '$location', '$http', '$routeParams', '$rootScope', '$templateCache', 'breadcrumbs',
  function($scope, $location, $http, $routeParams, $rootScope, $templateCache, breadcrumbs) {
    // Load pagination partial template into template cache
    var paginationTemplate = fs.readFileSync(__dirname + '/../templates/partials/pagination.html');
    $templateCache.put('partials/pagination.html', paginationTemplate);

    // TODO: this needs to be grabbed from user settings
    var limit = ($location.search()).limit;
    var threadsPerPage = limit ? Number(limit) : 10;

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
