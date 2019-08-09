module.exports = ['$location', '$state', function($location, $state) {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    scope: { pageCount: '=', focus: '=', clickAction: '=' },
    template:
    `<div class="jump-to-page">
       <input ng-model="pageNum" auto-focus="focus" select="true" type="number" min="1" max="{{pageCount}}" ng-keyup="$event.keyCode === 13 && goToPage()" />
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
        if (scope.clickAction) { scope.clickAction(); }
      };

      scope.$watch(function() { return $location.search().page; }, function(newPage) {
        scope.pageNum = Number(newPage) || 1;
      });
    }
  };
}];
