module.exports = ['$scope', '$rootScope', 'Boards',
  function($scope, $rootScope, Boards) {
    Boards.query().$promise
    .then(function(categorizedBoards) {
      $scope.categorizedBoards = categorizedBoards;
    });
  }
];
