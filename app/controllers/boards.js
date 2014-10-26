module.exports = ['$timeout', '$anchorScroll', 'boards',
  function($timeout, $anchorScroll, boards) {
    this.categorizedBoards = boards;
    console.log(boards);
    $timeout(function() {
      $anchorScroll();
    });
  }
];
