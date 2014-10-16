module.exports = ['$scope', '$timeout', '$anchorScroll', 'Boards',
  function($scope, $timeout, $anchorScroll, Boards) {
    Boards.query().$promise
    .then(function(categorizedBoards) {
      $scope.categorizedBoards = categorizedBoards;
      $timeout(function() {
        $anchorScroll();
      });
    });
  }
];
