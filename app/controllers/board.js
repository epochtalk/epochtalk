module.exports = ['$scope', '$stateParams', '$window', 'Auth', 'Threads', 'board', 'threads', 'page', 'threadLimit', 'postLimit',
  function($scope, $stateParams, $window, Auth, Threads, board, threads, page, threadLimit, postLimit) {
    var ctrl = this;
    this.loggedIn = Auth.isAuthenticated; // check Auth
    this.page = page; // this page
    this.postLimit = postLimit;
    this.threadLimit = threadLimit;

    board.$promise.then(function(board) {
      ctrl.board = board;
      ctrl.newThreadUrl = '/boards/' + board.id + '/threads/new';
      ctrl.pageCount = Math.ceil(board.thread_count / threadLimit);
    });

    // generate page listing for each thread
    var getPageKeysForThread = function(thread) {
      var pageKeys = [];
      var urlPrefix = '/threads/' + thread.id + '/posts?page=';
      if (thread.page_count < 7) {
        var i = 1;
        while(pageKeys.push({ val: i.toString(), url: urlPrefix + i++}) < thread.page_count) {}
      }
      else {
        var thirdToLastPage = (thread.page_count - 2).toString();
        var secondToLastPage = (thread.page_count - 1).toString();
        var lastPage = thread.page_count.toString();
        pageKeys.push({ val: '1', url: urlPrefix + '1' });
        pageKeys.push({ val: '2', url: urlPrefix + '2' });
        pageKeys.push({ val: '3', url: urlPrefix + '3' });
        pageKeys.push({ val: '&hellip;', url: null });
        pageKeys.push({ val: thirdToLastPage, url: urlPrefix + thirdToLastPage });
        pageKeys.push({ val: secondToLastPage, url: urlPrefix + secondToLastPage });
        pageKeys.push({ val: lastPage, url: urlPrefix + lastPage });
      }
      pageKeys.push({ val: 'All', url: urlPrefix + '1&limit=all' });
      thread.page_keys = pageKeys;
    };

    // page count for each thread
    threads.$promise.then(function(threads) {
      ctrl.threads = threads;
      threads.forEach(function(thread) {
        thread.page_count = Math.ceil(thread.post_count / postLimit);
        getPageKeysForThread(thread);
        // user based UI
        if (thread.has_new_post) { thread.title_class = 'bold-title'; }
      });
    });

    // // pagination


    // $scope.$on('$stateChangeStart', function() {
    //   var query = {
    //     board_id: $stateParams.boardId,
    //     limit: $stateParams.limit,
    //     page: $stateParams.page
    //   };
    //   return Threads.byBoard(query).$promise.then(function(threads) {
    //     // scroll to top when loading new threads since this isn't a true route change
    //     $window.scrollTo(0,0);

    //     // update page number
    //     ctrl.page = Number($stateParams.page);
    //     ctrl.threadLimit = Number($stateParams.limit) || 10;
    //     // update thread with page count
    //     ctrl.threads = threads;
    //     threads.forEach(function(thread) {
    //       thread.page_count = Math.ceil(thread.post_count / ctrl.postLimit);
    //       getPageKeysForThread(thread);
    //       // user based UI
    //       if (thread.has_new_post) { thread.title_class = 'bold-title'; }
    //     });
    //   });
    // });
  }
];
