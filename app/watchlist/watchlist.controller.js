var ctrl = ['$rootScope', '$scope', '$anchorScroll', '$location', '$timeout', 'Session',  'Watchlist', 'pageData',
  function($rootScope, $scope, $anchorScroll, $location, $timeout, Session, Watchlist, pageData) {

    // page variables
    var ctrl = this;
    this.loggedIn = Session.isAuthenticated;
    this.viewType = 'unread';

    // index variables
    this.page = pageData.page;
    this.limit = pageData.limit;
    this.threads = pageData.threads;
    this.hasMoreThreads = pageData.hasMoreThreads;

    // Scroll fix for nested state
    $timeout($anchorScroll);

    // generate page listing for each thread
    this.getPageKeysForThread = function(thread) {
      var pageKeys = [];
      if (thread.page_count < 7) {
        var i = 1;
        while(pageKeys.push({ val: i++, threadId: thread.id}) < thread.page_count) {}
      }
      else {
        var thirdToLastPage = (thread.page_count - 2);
        var secondToLastPage = (thread.page_count - 1);
        var lastPage = thread.page_count;
        pageKeys.push({ val: 1, threadId: thread.id });
        pageKeys.push({ val: 2, threadId: thread.id });
        pageKeys.push({ val: 3, threadId: thread.id });
        pageKeys.push({ val: '&hellip;', threadId: null });
        pageKeys.push({ val: thirdToLastPage, threadId: thread.id });
        pageKeys.push({ val: secondToLastPage, threadId: thread.id });
        pageKeys.push({ val: lastPage, threadId: thread.id });
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

    this.pullPage = function(pageIncrement) {
      ctrl.page = ctrl.page + pageIncrement;
      var query = { page: ctrl.page, limit: ctrl.limit };

      // replace current threads with new threads
      Watchlist.index(query).$promise
      .then(function(pageData) {
        ctrl.hasMoreThreadss = pageData.hasMoreThreads;
        ctrl.threads = pageData.threads;
        ctrl.threads.forEach(threadPageCount);
        $timeout($anchorScroll);
      });
    };

  }
];

module.exports = angular.module('eptc.watchtlist.ctrl', [])
.controller('WatchlistCtrl', ctrl)
.name;
