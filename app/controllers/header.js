module.exports = ['$scope', '$route', '$rootScope', '$window', 'Auth', 'breadcrumbs',
  function($scope, $route, $rootScope, $window, Auth, breadcrumbs) {
    $rootScope.breadcrumbs = breadcrumbs.get();
    $scope.loggedIn = false;
    $scope.loginState = 'Not Logged In';
    $scope.user = {};
    // check user auth state
    Auth.isAuthenticated(function(authenticated) {
      if (authenticated) {
        var username = Auth.currentUser();
        $scope.loggedIn = true;
        $scope.loginState = 'Logged In as ' + username;
      }
      else {
        $scope.loggedIn = false;
        $scope.loginState = 'Not Logged In';
      }
    });

    $scope.login = function() {
      Auth.login($scope.user,
        function(data) {
          $scope.loggedIn = true;
          $scope.loginState = 'Logged In as ' + $scope.user.username;
          $scope.user.username = '';
          $scope.user.password = '';
        },
        function(err) {
          $scope.loggedIn = false;
          $scope.loginState = 'Not Logged In';
        }
      );
    };

    $scope.logout = function() {
      Auth.logout(function() {
        $scope.loggedIn = false;
        $scope.loginState = 'Not Logged In';
      });
    };
  }
];
