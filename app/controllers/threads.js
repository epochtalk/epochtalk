module.exports = ['$scope', '$routeParams',
  function($scope, $routeParams) {
    $scope.parentPostId = $routeParams.parentPostId;
  }
];
