module.exports = ['$scope', '$http', '$rootScope', 'breadcrumbs',
  function($scope, $http, $rootScope, breadcrumbs) {
    $http.get('/api/boards').success(function(boards) {
      $scope.boards = boards;
      $rootScope.breadcrumbs = breadcrumbs.get();
    });
  }
];
