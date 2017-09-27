module.exports = ['$location', '$state', function($location, $state) {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    scope: { pageCount: '=' },
    template:
    `<div class="jump-to-page">
      <input ng-model="pageNum" type="number" />
      <button ng-click="goToPage()">Go</button>
    </div>`,
    link: function(scope) {
      scope.pageNum = Number($location.search().page) || 1;

      scope.goToPage = function() {
        // default to last page
        var page = scope.pageNum;

        if (page > scope.pageCount) {
          page = scope.pageCount;
        }
        else if (scope.pageNum < 1) {
          page = 1;
        }

        $state.go($state.current, { page: page });
      };

      scope.$watch(function() { return $location.search().page; }, function(newPage) {
        scope.pageNum = Number(newPage) || 1;
      });
    }
  };
}];
