var ctrl = ['$rootScope', '$scope', '$anchorScroll', '$location', '$timeout', 'Alert', 'BanSvc', 'Session', 'Threads', 'Watchlist', 'PreferencesSvc', 'pageData',
  function($rootScope, $scope, $anchorScroll, $location, $timeout, Alert, BanSvc, Session, Threads, Watchlist, PreferencesSvc, pageData) {
    var ctrl = this;
    var prefs = PreferencesSvc.preferences;
    this.loggedIn = Session.isAuthenticated; // check Auth
    this.board = pageData.board;
    this.page = pageData.page; // this page
    this.limit = pageData.limit;
    this.threads = pageData.normal;
    this.stickyThreads = pageData.sticky;

    this.parent = $scope.$parent.ThreadsWrapperCtrl;
    this.parent.loggedIn = Session.isAuthenticated;
    this.parent.board  = pageData.board;
    this.parent.page = pageData.page;
    this.parent.pageCount = Math.ceil(ctrl.board.thread_count / ctrl.limit);
    // TODO: This will not be here once actual boards are stored in this array
    this.parent.bannedFromBoard = BanSvc.banStatus().boards.length > 0;

    this.parent.canCreate = function() {
      if (!ctrl.loggedIn()) { return false; }
      if (ctrl.parent.bannedFromBoard) { return false; }
      if (!Session.hasPermission('threads.create.allow')) { return false; }
      if (!pageData.write_access) { return false; }
      return true;
    };

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
      thread.page_count = Math.ceil(thread.post_count / (prefs.posts_per_page || 25));
      ctrl.getPageKeysForThread(thread);
    }
    this.threads.forEach(threadPageCount);
    this.stickyThreads.forEach(threadPageCount);

    // Scroll fix for nested state
    $timeout($anchorScroll);

    this.offLCS = $rootScope.$on('$locationChangeSuccess', function() {
      var params = $location.search();
      var page = Number(params.page) || 1;
      var limit = Number(params.limit);
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

    this.parent.watchBoard = function() {
      var params = { boardId: ctrl.board.id };
      return Watchlist.watchBoard(params).$promise
      .then(function() {
        ctrl.board.watched = true;
        ctrl.parent.board.watched = true;
        Alert.success('This board is being watched');
      })
      .catch(function() { Alert.error('Error watching this board'); });
    };

    this.parent.showSetModerators = false;
    this.parent.canSetModerator = function() {
      if (!ctrl.loggedIn()) { return false; }
      if (ctrl.parent.bannedFromBoard) { return false; }
      if (!Session.hasPermission('adminModerators.add')) { return false; }
      if (!Session.hasPermission('adminModerators.remove')) { return false; }
      return true;
    };
  }
];

require('../../components/set_moderators/set-moderators.directive');

module.exports = angular.module('ept.threads.ctrl', [])
.controller('ThreadsCtrl', ctrl)
.name;
