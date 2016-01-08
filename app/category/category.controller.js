module.exports = ['$timeout', '$anchorScroll', 'boardsByCategory',
  function($timeout, $anchorScroll, boardsByCategory) {
    var ctrl = this;
    this.category = boardsByCategory.category;
    this.boards = boardsByCategory.boards;
    this.toggles = false;

    // Category toggling
    this.toggle = function(index){
      ctrl.toggles = !ctrl.toggles;
    };

    function countTotals(countBoards) {
      var thread_count = 0;
      var post_count = 0;

      if (countBoards.length > 0) {
        countBoards.forEach(function(board) {
          var children = countTotals(board.children);
          thread_count += children.thread_count + board.thread_count;
          post_count += children.post_count + board.post_count;
          board.total_thread_count = thread_count;
          board.total_post_count = post_count;
        });
      }

      return {thread_count: thread_count, post_count: post_count};
    }

    $timeout($anchorScroll);
  }
];
