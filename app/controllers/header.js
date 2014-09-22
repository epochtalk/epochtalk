module.exports = ['$scope', '$rootScope', 'Auth', 'breadcrumbs',
  function($scope, $rootScope, Auth, breadcrumbs) {
    $rootScope.breadcrumbs = breadcrumbs.get();
    $scope.loggedIn = Auth.isAuthenticated;
    $scope.loginStateGreeting = Auth.loginStateGreeting;
    $scope.currentUser = Auth.currentUser;
    $scope.user = {};

    Auth.checkAuthentication();

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
