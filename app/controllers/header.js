module.exports = ['$scope', '$rootScope', '$route', '$timeout', 'Auth', 'breadcrumbs',
  function($scope, $rootScope, $route, $timeout, Auth, breadcrumbs) {
    $rootScope.breadcrumbs = breadcrumbs.get();
    $scope.loggedIn = Auth.isAuthenticated;
    $scope.loginStateGreeting = Auth.loginStateGreeting;
    $scope.currentUser = Auth.currentUser;
    $scope.user = {};

    Auth.checkAuthentication();

    $scope.enterLogin = function(keyEvent) {
      if (keyEvent.which === 13) {
        $scope.login();
      }
    };

    $scope.login = function() {
      Auth.login($scope.user,
        function(data) {
          $scope.user.username = '';
          $scope.user.password = '';
          $timeout(function() { $route.reload(); });
        }
      );
    };

    $scope.logout = function() {
      Auth.logout(function(data) {
        $timeout(function() { $route.reload(); });
      });
    };
  }
];
