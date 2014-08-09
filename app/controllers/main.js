module.exports = ['$scope', '$location', '$rootScope', 'breadcrumbs',
  function($scope, $location, $rootScope, breadcrumbs) {
    $rootScope.breadcrumbs = breadcrumbs.get();
    $location.path('/boards');
  }
];
