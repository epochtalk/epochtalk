var _ = require('lodash');

module.exports = ['$timeout', '$anchorScroll', 'boards',
  function($timeout, $anchorScroll, boards) {
    var ctrl = this;
    this.toggles = {};

    // sort categories by view_order
    var sortedCats = _.sortBy(boards, function(cat) { return cat.view_order; });
    this.categorizedBoards = sortedCats;

    // Category toggling
    var i = 0;
    sortedCats.forEach(function() { ctrl.toggles[i++] = false; });
    this.toggle = function(index){
      ctrl.toggles[index] = !ctrl.toggles[index];
    };

    // set total_thread_count and total_post_count for all boards
    sortedCats.map(function(category) {
      var boards = category.boards;
      boards.map(function(board) {
        var children = countTotals(board.children);
        board.total_thread_count = children.thread_count + board.thread_count;
        board.total_post_count = children.post_count + board.post_count;
      });
    });

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
