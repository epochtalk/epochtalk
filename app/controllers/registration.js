module.exports = ['$scope', '$location', '$rootScope', 'Auth', 'breadcrumbs',
  function($scope, $location, $rootScope, Auth, breadcrumbs) {
    $rootScope.breadcrumbs = breadcrumbs.get();
    $scope.user = {};
    $scope.error = {};
    $scope.error.register = {};
    $scope.error.username = {};
    $scope.error.email = {};
    $scope.error.password = {};
    $scope.error.confirmation = {};

    $scope.register = function() {
      Auth.register($scope.user,
        function() { $location.path('/'); },
        function(err) {
          $scope.error.register.classes = "no-margin";
          $scope.error.register.message = 'Could Not Register You';
        }
      );
    };

    $scope.checkUsername = function() {

    };

    $scope.checkEmail = function() {

    };
  }
];
