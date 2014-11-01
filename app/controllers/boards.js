module.exports = ['$timeout', '$anchorScroll', 'boards',
  function($timeout, $anchorScroll, boards) {
    var ctrl = this;

    boards.$promise.then(function(allBoards) {
      ctrl.categorizedBoards = allBoards;
      $timeout($anchorScroll);
    });
  }
];
