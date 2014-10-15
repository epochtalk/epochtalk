module.exports = ['$scope', '$routeParams', '$rootScope', 'BreadcrumbSvc',
  function($scope, $routeParams, $rootScope, BreadcrumbSvc) {
    BreadcrumbSvc.update('profile');
  }
];

