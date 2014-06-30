module.exports = ['$scope', '$routeParams', '$http',
  function($scope, $routeParams, $http) {
    $scope.parentPostId = $routeParams.parentPostId;
    $http.get('/api/threads/' + $scope.parentPostId).success(function(thread) {
      console.log(thread);
    });
  }
];
