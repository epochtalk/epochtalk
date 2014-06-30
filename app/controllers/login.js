module.exports = ['$scope', '$route', 'Auth',
  function($scope, $route, Auth) {
    $scope.login = function(form) {
      Auth.login('password', $scope.user, function(success) {
        $route.reload();
      });
    };
  }
];
