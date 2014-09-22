module.exports = ['$scope', '$http', '$rootScope', 'breadcrumbs',
  function($scope, $http, $rootScope, breadcrumbs) {
    $http.get('/api/boards').success(function(categories) {
      $scope.categories = categories;
      $rootScope.breadcrumbs = breadcrumbs.get();
    });
  }
];
