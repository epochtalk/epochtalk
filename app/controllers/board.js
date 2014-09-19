module.exports = ['$scope', '$location', '$http', '$routeParams', '$rootScope', 'breadcrumbs',
  function($scope, $location, $http, $routeParams, $rootScope, breadcrumbs) {
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
          getPageKeysForThread(thread);
        });
        $scope.threads = threads;
      });
    });

    var getPageKeysForThread = function(thread) {
      var pageKeys = [];
      var urlPrefix = '/threads/' + thread.id + '/posts?page=';
      if (thread.page_count < 7) {
        var i = 1;
        while(pageKeys.push({ val: i.toString(), url: urlPrefix + i++}) < thread.page_count);
      }
      else {
        var thirdToLastPage = (thread.page_count - 2).toString();
        var secondToLastPage = (thread.page_count - 1).toString();
        var lastPage = thread.page_count.toString();
        pageKeys.push({ val: '1', url: urlPrefix + '1' });
        pageKeys.push({ val: '2', url: urlPrefix + '2' });
        pageKeys.push({ val: '3', url: urlPrefix + '3' });
        pageKeys.push({ val: '&hellip;', url: null });
        pageKeys.push({ val: thirdToLastPage, url: urlPrefix + thirdToLastPage });
        pageKeys.push({ val: secondToLastPage, url: urlPrefix + secondToLastPage });
        pageKeys.push({ val: lastPage, url: urlPrefix + lastPage });
      }
      pageKeys.push({ val: 'All', url: urlPrefix + '1&limit=' + thread.post_count });
      thread.page_keys = pageKeys;
    };

  }
];
