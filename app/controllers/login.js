module.exports = ['$scope', '$route', 'Auth', '$rootScope', 'breadcrumbs',
  function($scope, $route, Auth, $rootScope, breadcrumbs) {
    $rootScope.breadcrumbs = breadcrumbs.get();
    $scope.login = function(form) {
      Auth.login('password', $scope.user, function(success) {
        $route.reload();
      });
    };
  }
];
