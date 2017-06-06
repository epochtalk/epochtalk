var ctrl = ['$timeout', '$anchorScroll', 'Session', 'Alert', 'Watchlist', 'pageData',
  function($timeout, $anchorScroll, Session, Alert, Watchlist, pageData) {

    // page variables
    var ctrl = this;
    this.loggedIn = Session.isAuthenticated;
    this.viewType = 'edit';

    // thread variables
    this.threadPage = pageData.page;
    this.threadLimit = pageData.limit;
    this.threads = pageData.threads;
    this.hasMoreThreads = pageData.has_more_threads;

    // board variables
    this.boardPage = pageData.page;
    this.boardLimit = pageData.limit;
    this.boards = pageData.boards;
    this.hasMoreBoards = pageData.has_more_boards;

    this.unwatchThread = function(threadId, threadTitle) {
      return Watchlist.unwatchThread({ threadId: threadId }).$promise
      .then(function() {
        $timeout(function() {
          Alert.success('No longer watching thread: ' + threadTitle);
          $anchorScroll();
        });
      })
      .catch(function() {
        Alert.error('There was a problem unwatching that thread.');
      });
    };

    this.unwatchBoard = function(boardId, boardName) {
      return Watchlist.unwatchBoard({ boardId: boardId }).$promise
      .then(function() {
        Alert.success('No longer watching board: ' + boardName);
      })
      .catch(function() {
        Alert.error('There was a problem unwatching that board.');
      });
    };

    this.watchThread = function(threadId, threadTitle) {
      return Watchlist.watchThread({ threadId: threadId }).$promise
      .then(function() {
        Alert.success('Watching thread: ' + threadTitle);
      })
      .catch(function() {
        Alert.error('There was a problem unwatching that thread.');
      });
    };

    this.watchBoard = function(boardId, boardName) {
      return Watchlist.watchBoard({ boardId: boardId }).$promise
      .then(function() {
        Alert.success('Watching Board: ' + boardName);
      })
      .catch(function() {
        Alert.error('There was a problem unwatching that board.');
      });
    };

    this.pullThreads = function(pageIncrement) {
      ctrl.threadPage = ctrl.threadPage + pageIncrement;
      var query = { page: ctrl.threadPage, limit: ctrl.threadLimit };

      // replace current threads with new threads
      Watchlist.pageThreads(query).$promise
      .then(function(pageData) {
        ctrl.hasMoreThreads = pageData.has_more_threads;
        ctrl.threads = pageData.threads;
      });
    };

    this.pullBoards = function(pageIncrement) {
      ctrl.boardPage = ctrl.boardPage + pageIncrement;
      var query = { page: ctrl.boardPage, limit: ctrl.boardLimit };

      // replace current threads with new threads
      Watchlist.pageBoards(query).$promise
      .then(function(pageData) {
        ctrl.hasMoreBoards = pageData.has_more_boards;
        ctrl.boards = pageData.boards;
      });
    };

  }
];

module.exports = angular.module('ept.watchlist.edit.ctrl', [])
.controller('WatchlistEditCtrl', ctrl)
.name;
