var ctrl = ['$rootScope', '$scope', '$anchorScroll', '$location', '$timeout', 'Alert', 'BanSvc', 'Session', 'Threads', 'Watchlist', 'PreferencesSvc', 'pageData',
  function($rootScope, $scope, $anchorScroll, $location, $timeout, Alert, BanSvc, Session, Threads, Watchlist, PreferencesSvc, pageData) {
    var ctrl = this;
    var prefs = PreferencesSvc.preferences;
    var ignoredBoards = prefs.ignored_boards || [];
    this.loggedIn = Session.isAuthenticated; // check Auth
    this.board = pageData.board;
    this.page = pageData.page; // this page
    this.limit = pageData.limit;
    this.field = pageData.field;
    this.desc = pageData.desc;
    this.threads = pageData.normal;
    this.stickyThreads = pageData.sticky;

    this.parent = $scope.$parent.ThreadsWrapperCtrl;
    this.parent.loggedIn = Session.isAuthenticated;
    this.parent.board  = pageData.board;
    this.parent.page = pageData.page;
    this.parent.queryParams = $location.search();
    this.parent.pageCount = Math.ceil((ctrl.board.thread_count - ctrl.board.sticky_thread_count) / ctrl.limit) || 1;
    // TODO: This will not be here once actual boards are stored in this array
    this.parent.bannedFromBoard = BanSvc.banStatus();

    this.parent.canCreate = function() {
      if (!ctrl.loggedIn()) { return false; }
      if (BanSvc.banStatus()) { return false; }
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

    this.board.children = filterIgnoredBoards(this.board.children);

    function filterIgnoredBoards(boards) {
      return boards.filter(function(board) {
        board.children = filterIgnoredBoards(board.children)
        return ignoredBoards.indexOf(board.id) === -1;
      });
    }

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
        while(pageKeys.push({ val: i++, slug: thread.slug}) < thread.page_count) {}
      }
      else {
        var thirdToLastPage = (thread.page_count - 2);
        var secondToLastPage = (thread.page_count - 1);
        var lastPage = thread.page_count;
        pageKeys.push({ val: 1, slug: thread.slug });
        pageKeys.push({ val: 2, slug: thread.slug });
        pageKeys.push({ val: 3, slug: thread.slug });
        pageKeys.push({ val: '&hellip;', slug: null });
        pageKeys.push({ val: thirdToLastPage, slug: thread.slug });
        pageKeys.push({ val: secondToLastPage, slug: thread.slug });
        pageKeys.push({ val: lastPage, slug: thread.slug });
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

    this.setSortField = function(sortField) {
      // Sort Field hasn't changed just toggle desc
      var unchanged = sortField === ctrl.field || (sortField === 'username' && !ctrl.field);
      if (unchanged) { ctrl.desc = ctrl.desc ? 'false' : 'true'; } // bool to str
      // Sort Field changed default to ascending order
      else { ctrl.desc = 'false'; }
      ctrl.field = sortField;
      ctrl.page = 1;
      ctrl.parent.page = 1;
      $location.search('page', ctrl.page);
      $location.search('desc', ctrl.desc);
      $location.search('field', sortField);

      // Update queryParams (forces pagination to refresh)
      ctrl.parent.queryParams = $location.search();
    };

    this.getSortClass = function(sortField) {
      var sortClass;
      var desc = ctrl.desc;
      // Username is sorted asc by default
      if (sortField === 'username' && !ctrl.field && !desc) {
        sortClass = 'fa fa-sort-asc';
      }
      else if (ctrl.field === sortField && desc) {
        sortClass = 'fa fa-sort-desc';
      }
      else if (ctrl.field === sortField && !desc) {
        sortClass = 'fa fa-sort-asc';
      }
      else { sortClass = 'fa fa-sort'; }
      return sortClass;
    };

    // Scroll fix for nested state
    $timeout($anchorScroll);

    this.offLCS = $rootScope.$on('$locationChangeSuccess', function() {
      var params = $location.search();
      var page = Number(params.page) || 1;
      var limit = Number(params.limit);
      var field = params.field;
      var descending = params.desc === 'true' || params.desc === undefined;
      var pageChanged = false;
      var limitChanged = false;
      var fieldChanged = false;
      var descChanged = false;

      if (page && page !== ctrl.page) {
        pageChanged = true;
        ctrl.parent.page = page;
        ctrl.page = page;
      }
      if (limit && limit !== ctrl.limit) {
        limitChanged = true;
        ctrl.limit = limit;
      }
      if (field && field !== ctrl.field) {
        fieldChanged = true;
        ctrl.field = field;
      }
      if (descending !== ctrl.desc) {
        descChanged = true;
        ctrl.desc = descending;
      }
      if(pageChanged || limitChanged || fieldChanged || descChanged) { ctrl.pullPage(); }
    });
    $scope.$on('$destroy', function() { ctrl.offLCS(); });

    this.pullPage = function() {
      var query = {
        board_id: ctrl.board.id,
        page: ctrl.page,
        limit: ctrl.limit,
        desc: ctrl.desc,
        field: ctrl.field
      };

      // replace current threads with new threads
      Threads.byBoard(query).$promise
      .then(function(pageData) {
        ctrl.parent.pageCount = Math.ceil((pageData.board.thread_count - pageData.board.sticky_thread_count) / ctrl.limit) || 1;
        ctrl.page = pageData.page;
        ctrl.limit = pageData.limit;
        ctrl.field = pageData.field;
        ctrl.desc = pageData.desc;
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
      if (BanSvc.banStatus()) { return false; }
      if (!Session.hasPermission('moderators.add.allow')) { return false; }
      if (!Session.hasPermission('moderators.remove.allow')) { return false; }
      return true;
    };
  }
];

require('./../../../modules/ept-moderators/set-moderators.directive');

module.exports = angular.module('ept.threads.ctrl', [])
.controller('ThreadsCtrl', ctrl)
.name;
