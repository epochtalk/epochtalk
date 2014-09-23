module.exports = ['$scope', '$rootScope', '$route', 'Auth', 'breadcrumbs',
  function($scope, $rootScope, $route, Auth, breadcrumbs) {
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
          $route.reload();
        }
      );
    };

    $scope.logout = function() {
      Auth.logout(function(data) {
        $route.reload();
      });
    };
  }
];
