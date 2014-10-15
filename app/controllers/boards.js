module.exports = ['$scope', '$rootScope', 'Boards', 'BreadcrumbSvc',
  function($scope, $rootScope, Boards, BreadcrumbSvc) {
    Boards.query().$promise
    .then(function(categorizedBoards) {
      $scope.categorizedBoards = categorizedBoards;
      BreadcrumbSvc.update('home');
    });
  }
];
