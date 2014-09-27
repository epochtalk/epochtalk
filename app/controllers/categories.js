module.exports = ['$scope', '$http', '$rootScope', 'breadcrumbs',
  function($scope, $http, $rootScope, breadcrumbs) {
    $http.get('/api/boards').success(function(categories) {
      $rootScope.breadcrumbs = breadcrumbs.get();
      $http.get('/api/boards/all').success(function(allBoards) {
        $scope.boards = allBoards;
        $scope.categories = categories;
      });
    });
  }
];
