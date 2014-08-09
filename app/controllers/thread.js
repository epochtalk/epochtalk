module.exports = ['$scope', '$routeParams', '$http','$rootScope', 'breadcrumbs',
  function($scope, $routeParams, $http, $rootScope, breadcrumbs) {
    $rootScope.breadcrumbs = breadcrumbs.get();
    $scope.parentPostId = $routeParams.parentPostId;
    $http.get('/api/threads/' + $scope.parentPostId).success(function(thread) {
      console.log(thread);
    });
  }
];
