var fs = require('fs');

module.exports = ['$location', function($location) {
  return {
    restrict: 'E',
    scope: false,
    template: fs.readFileSync(__dirname + '/../../templates/pagination.html'),
    link: function($scope) {
      $scope.$watch('pageCount', function (newPageCount) {
        var pageCount = newPageCount;
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
        var elipsis;
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
          elipsis = [{ index: 9, nextIndex: pageCount - 2 }];
          generatePageKeys(elipsis);
        }
        // Case 3: Truncate Head
        // 1 2 3 ... 9 10 [11] 12 13 14 15 16
        else if (truncate && page >= pageCount - 5) {
          elipsis = [{ index: 4, nextIndex: pageCount - 8 }];
          generatePageKeys(elipsis);
        }
        // Case 4: Truncate Head and Tail
        // 1 2 3 ... 7 8 [9] 10 11 ... 14 15 16
        else if (truncate && page > 6 && page < pageCount - 5) {
          elipsis = [
            { index: 4, nextIndex: page - 2 },
            { index: page + 3, nextIndex: pageCount - 2 }
          ];
          generatePageKeys(elipsis);
        }
        $scope.paginationKeys = paginationKeys;
        console.log($scope.paginationKeys);
      }, true);

    }
  };
}];