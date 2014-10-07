module.exports = ['$scope', '$rootScope', 'Boards', 'breadcrumbs',
  function($scope, $rootScope, Boards, breadcrumbs) {
    Boards.query().$promise
    .then(function(categorizedBoards) {
      $scope.categorizedBoards = categorizedBoards;
      $rootScope.breadcrumbs = breadcrumbs.get();
    });
  }
];
