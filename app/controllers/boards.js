module.exports = ['$scope', '$http', '$rootScope', 'breadcrumbs',
  function($scope, $http, $rootScope, breadcrumbs) {
    $http.get('/api/boards').success(function(categorizedBoards) {
      $scope.categorizedBoards = categorizedBoards;
      $rootScope.breadcrumbs = breadcrumbs.get();
    });
  }
];
