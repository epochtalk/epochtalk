module.exports = ['$timeout', '$anchorScroll', 'boards',
  function($timeout, $anchorScroll, boards) {
    this.categorizedBoards = boards;
    $timeout(function() { $anchorScroll(); }, 100); // 100 for quick clicks
  }
];
