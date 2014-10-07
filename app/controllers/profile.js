module.exports = ['$scope', '$routeParams', '$rootScope', 'breadcrumbs',
  function($scope, $routeParams, $rootScope, breadcrumbs) {
    $rootScope.breadcrumbs = breadcrumbs.get();
  }
];

