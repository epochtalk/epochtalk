module.exports = ['$scope', '$rootScope', 'Auth', 'breadcrumbs',
  function($scope, $rootScope, Auth, breadcrumbs) {
    $rootScope.breadcrumbs = breadcrumbs.get();
    $scope.loggedIn = Auth.isAuthenticated;
    $scope.loginState = Auth.loginState;
    $scope.user = {};

    $scope.login = function() {
      Auth.login($scope.user,
        function(data) {
          $scope.user.username = '';
          $scope.user.password = '';
        }
      );
    };

    $scope.logout = function() {
      Auth.logout();
    };
  }
];
