var fs = require('fs');

module.exports = ['$location', '$filter', function($location, $filter) {
  return {
    restrict: 'E',
    scope: {
      pageCount: '=',
      page: '=',
      pageState: '@',
      queryParams: '='
    },
    template: fs.readFileSync(__dirname + '/pagination.html'),
    link: function(scope) {
      // Update if pageCount or page changes
      scope.$watchGroup(['pageCount', 'page'], function() {
        buildPages();
      });

      // Update pagination if any of the other query strings change
      scope.$watch('queryParams', function () {
        buildPages();
      }, true);

      var buildPages = function() {
        scope.paginationKeys = [];
        var ellipsis;
        var truncate = scope.pageCount > 15;

        // Case 1: No Truncation up to 15 pages
        // [1] 2 3 4 5 6 7 8 9 10 11 13 14 15
        if (!truncate) { generatePageKeys(undefined); }
        // Case 2: Truncate Tail
        // 1 2 3 4 5 [6] 7 8 ... 14 15 16
        else if (truncate && scope.page <= 6) {
          ellipsis = [{ index: 9, nextIndex: scope.pageCount - 2 }];
          generatePageKeys(ellipsis);
        }
        // Case 3: Truncate Head
        // 1 2 3 ... 9 10 [11] 12 13 14 15 16
        else if (truncate && scope.page >= scope.pageCount - 5) {
          ellipsis = [{ index: 4, nextIndex: scope.pageCount - 8 }];
          generatePageKeys(ellipsis);
        }
        // Case 4: Truncate Head and Tail
        // 1 2 3 ... 7 8 [9] 10 11 ... 14 15 16
        else if (truncate && scope.page > 6 && scope.page < scope.pageCount - 5) {
          ellipsis = [
            { index: 4, nextIndex: scope.page - 2 },
            { index: scope.page + 3, nextIndex: scope.pageCount - 2 }
          ];
          generatePageKeys(ellipsis);
        }
      };

      var generatePageKeys = function(ellipsis) {
        // Add Previous Button
        var prevBtnKey = { val: '&#10094;' };
        var opts;
        if (scope.page > 1) {
          prevBtnKey.class = 'arrow';
          opts = angular.copy($location.search());
          opts.page = (scope.page - 1);
          prevBtnKey.opts = opts;
          scope.paginationKeys.push(prevBtnKey);
        }
        else {
          prevBtnKey.class = 'arrow unavailable';
          prevBtnKey.opts = null;
          scope.paginationKeys.push(prevBtnKey);
        }
        // Add Pagination Keys
        var ellipsisIndex = 0;
        var index = 1;
        while (index <= scope.pageCount) {
          var pageKey;
          if (ellipsis && ellipsis[ellipsisIndex] && ellipsis[ellipsisIndex].index === index) {
            pageKey = {
              val: '&hellip;',
              opts: null,
              class: 'unavailable'
            };
            index = ellipsis[ellipsisIndex].nextIndex;
            ellipsisIndex++;
          }
          else {
            opts = angular.copy($location.search());
            opts.page = index;
            pageKey = {
              val: $filter('number')(index, 0),
              opts: opts,
              class: index === scope.page ? 'current' : null
            };
            index++;
          }
          scope.paginationKeys.push(pageKey);
        }

        // Add Next Button
        var nextBtnKey = { val: '&#10095;' };
        if (scope.page < scope.pageCount) {
          opts = angular.copy($location.search());
          opts.page = (scope.page + 1);
          nextBtnKey.class = 'arrow';
          nextBtnKey.opts = opts;
          scope.paginationKeys.push(nextBtnKey);
        }
        else {
          nextBtnKey.class = 'arrow unavailable';
          nextBtnKey.opts = null;
          scope.paginationKeys.push(nextBtnKey);
        }
      };

    }
  };
}];
