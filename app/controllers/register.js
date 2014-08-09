module.exports = ['$scope', 'Auth', '$rootScope', 'breadcrumbs',
  function($scope, Auth, $rootScope, breadcrumbs) {
    $rootScope.breadcrumbs = breadcrumbs.get();
    $scope.register = function(form) {
      Auth.register('password', $scope.user);
    };
  }
];
