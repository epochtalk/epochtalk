module.exports = ['$rootScope', '$scope', '$anchorScroll', '$location', '$timeout', 'Session', 'Boards', 'Threads', 'pageData',
  function($rootScope, $scope, $anchorScroll, $location, $timeout, Session, Boards, Threads, pageData) {
    var ctrl = this;
    this.loggedIn = Session.isAuthenticated; // check Auth
    this.board = pageData.board;
    this.page = pageData.page; // this page
    this.limit = pageData.limit;
    this.threads = pageData.normal;
    this.stickyThreads = pageData.sticky;

    this.parent = $scope.$parent.BoardWrapperCtrl;
    this.parent.loggedIn = Session.isAuthenticated;
    this.parent.board  = pageData.board;
    this.parent.page = pageData.page;
    this.parent.pageCount = Math.ceil(this.board.thread_count / this.limit);

    // set total_thread_count and total_post_count for all boards
    this.board.children.map(function(childBoard) {
      var children = countTotals(childBoard.children);
      childBoard.total_thread_count = children.thread_count + childBoard.thread_count;
      childBoard.total_post_count = children.post_count + childBoard.post_count;
    });

    function countTotals(countBoards) {
      var thread_count = 0;
      var post_count = 0;

      if (countBoards.length > 0) {
        countBoards.forEach(function(countBoard) {
          var children = countTotals(countBoard.children);
          thread_count += children.thread_count + countBoard.thread_count;
          post_count += children.post_count + countBoard.post_count;
          countBoard.total_thread_count = thread_count;
          countBoard.total_post_count = post_count;
        });
      }

      return {thread_count: thread_count, post_count: post_count};
    }

    // generate page listing for each thread
    this.getPageKeysForThread = function(thread) {
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
      thread.page_keys = pageKeys;
    };

    // page count for each thread
    function threadPageCount(thread) {
      // user based UI
      if (thread.has_new_post) { thread.title_class = 'bold'; }
      thread.page_count = Math.ceil(thread.post_count / ctrl.limit);
      ctrl.getPageKeysForThread(thread);
    }
    this.threads.forEach(threadPageCount);
    this.stickyThreads.forEach(threadPageCount);

    // Scroll fix for nested state
    $timeout($anchorScroll);

    this.offLCS = $rootScope.$on('$locationChangeSuccess', function(event){
      var params = $location.search();
      var page = Number(params.page) || 1;
      var limit = Number(params.limit) || 25;
      var pageChanged = false;
      var limitChanged = false;

      if (page && page !== ctrl.page) {
        pageChanged = true;
        ctrl.parent.page = page;
        ctrl.page = page;
      }
      if (limit && limit !== ctrl.limit) {
        limitChanged = true;
        ctrl.limit = limit;
      }

      if(pageChanged || limitChanged) { ctrl.pullPage(); }
    });
    $scope.$on('$destroy', function() { ctrl.offLCS(); });

    this.pullPage = function() {
      var query = {
        board_id: ctrl.board.id,
        page: ctrl.page,
        limit: ctrl.limit
      };

      // replace current threads with new threads
      Threads.byBoard(query).$promise
      .then(function(pageData) {
        ctrl.parent.pageCount = Math.ceil(pageData.board.thread_count / ctrl.limit);
        ctrl.threads = pageData.normal;
        ctrl.stickyThreads = pageData.sticky;
        ctrl.threads.forEach(threadPageCount);
        ctrl.stickyThreads.forEach(threadPageCount);
        $timeout($anchorScroll);
      });
    };

  }
];
