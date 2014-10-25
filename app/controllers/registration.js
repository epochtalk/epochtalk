module.exports = ['$scope', '$location', '$rootScope', 'Auth',
  function($scope, $location, $rootScope, Auth) {
    $scope.user = {};
    $scope.error = {};

    $scope.register = function() {
      $scope.error = {};

      Auth.register($scope.user,
        function() { $location.path('/'); },
        function(err) {
          $scope.error.status = true;
          $scope.error.message = err.data.message;
        }
      );
    };
  }
];
