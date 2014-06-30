module.exports = ['$scope', '$http', '$route', 'User',
  function($scope, $http, $route, User) {
    $scope.loggedIn = false;
    $scope.loginState = 'Not Logged In';

    $scope.logout = function() {
      User.logout(function(success) {
        console.log('success logout');
        $scope.loggedIn = false;
        $scope.loginState = 'Not Logged In';
        $route.reload();
      });
    };

    $http.get('/api/me')
    .success(function(user) {
      $scope.loggedIn = true;
      $scope.loginState = 'Logged In: ' + user.email;
    });
  }
];
