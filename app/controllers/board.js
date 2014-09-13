var fs = require('fs');

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
        });
        $scope.threads = threads;
        $scope.paginationKeys = getPaginationKeys();
      });
    });

    $scope.range = function(n) {
      return new Array(n);
    };

    var getPaginationKeys = function() {
      var pageCount = $scope.pageCount;
      var page = $scope.page;
      var generatePageKeys = function(elipsis) {
        // Add Previous Button
        var prevBtnKey = { val: '&laquo; Previous' };
        if (page > 1) {
          prevBtnKey.class = 'arrow';
          prevBtnKey.url = urlPrefix + (page - 1);
          paginationKeys.push(prevBtnKey);
        }
        else {
          prevBtnKey.class = 'arrow unavailable';
          prevBtnKey.url = null;
          paginationKeys.push(prevBtnKey);
        }

        // Add Pagination Keys
        var elipsisIndex = 0;
        var index = 1;
        while (index <= pageCount) {
          var pageKey;
          if (elipsis && elipsis[elipsisIndex] && elipsis[elipsisIndex].index === index) {
            pageKey = {
              val: '&hellip;',
              url: null,
              class: 'unavailable'
            };
            index = elipsis[elipsisIndex].nextIndex;
            elipsisIndex++;
          }
          else {
            pageKey = {
              val: index.toString(),
              url: urlPrefix + index,
              class: index === page ? 'current' : null
            };
            index++;
          }
          paginationKeys.push(pageKey);
        }

        // Add Next Button
        var nextBtnKey = { val: 'Next &raquo;' };
        if (page < pageCount) {
          nextBtnKey.class = 'arrow';
          nextBtnKey.url = urlPrefix + (page + 1);
          paginationKeys.push(nextBtnKey);
        }
        else {
          nextBtnKey.class = 'arrow unavailable';
          nextBtnKey.url = null;
          paginationKeys.push(nextBtnKey);
        }
      };

      var paginationKeys = [];
      var urlPrefix = $location.path() + '?page=';
      var truncate = pageCount > 15;
      // Case 1: No Truncation up to 15 pages
      // [1] 2 3 4 5 6 7 8 9 10 11 13 14 15
      if (!truncate) {
        generatePageKeys();
      }
      // Case 2: Truncate Tail
      // 1 2 3 4 5 [6] 7 8 ... 14 15 16
      else if (truncate && page <= 6) {
        var elipsis = [{ index: 9, nextIndex: pageCount - 2 }];
        generatePageKeys(elipsis);
      }
      // Case 3: Truncate Head
      // 1 2 3 ... 9 10 [11] 12 13 14 15 16
      else if (truncate && page >= pageCount - 5) {
        var elipsis = [{ index: 4, nextIndex: pageCount - 8 }];
        generatePageKeys(elipsis);
      }
      // Case 4: Truncate Head and Tail
      // 1 2 3 ... 7 8 [9] 10 11 ... 14 15 16
      else if (truncate && page > 6 && page < pageCount - 5) {
        var elipsis = [
          { index: 4, nextIndex: page - 2 },
          { index: page + 3, nextIndex: pageCount - 2 }
        ];
        generatePageKeys(elipsis);
      }
      return paginationKeys;
    };
  }
];
