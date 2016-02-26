var ctrl = ['$rootScope', '$scope', '$location', '$timeout', '$anchorScroll', 'Session', 'AdminUsers', 'bannedBoards', 'boards', function($rootScope, $scope, $location, $timeout, $anchorScroll, Session, AdminUsers, bannedBoards, boards) {
  var ctrl = this;
  this.parent = $scope.$parent.ModerationCtrl;
  this.parent.tab = 'board-bans';

  this.search = bannedBoards.search;
  this.searchStr = bannedBoards.search;
  this.page = bannedBoards.page;
  this.limit = bannedBoards.limit;
  this.next = bannedBoards.next;
  this.prev = bannedBoards.prev;
  this.modded = bannedBoards.modded;
  this.board = bannedBoards.board;
  this.bannedBoards = bannedBoards.data;

  this.allBoards = boards;
  this.moderating = Session.user.moderating;
  this.moderatedBoards = boards.filter(function(board) {
    var modded = ctrl.moderating.indexOf(board.id) > -1;
    if (modded) { return board; }
  });
  if (ctrl.modded) { ctrl.selectBoards = ctrl.moderatedBoards; }
  else { ctrl.selectBoards = ctrl.allBoards; }
  // Call init

  this.updateQueryParams = function() {
    $location.search('board', ctrl.board || undefined);
    $location.search('modded', ctrl.modded ? 'true' : undefined);
    $location.search('page', undefined); // reset to page one on filter apply

    if (ctrl.modded) { ctrl.selectBoards = ctrl.moderatedBoards; }
    else { ctrl.selectBoards = ctrl.allBoards; }
  };

  this.searchBannedUsers = function() {
    if (!ctrl.searchStr || !ctrl.searchStr.length) {
      ctrl.clearSearch();
      return;
    }
    $location.search({
      search: ctrl.searchStr || undefined,
      board: ctrl.board || undefined,
      modded: ctrl.modded || undefined,
      page: undefined
    });
  };

  this.clearSearch = function() {
    $location.search('search', undefined);
    ctrl.searchStr = null;
  };

  this.bannedFromModeratedBoard = function(boardIds) {
    // TODO: RETURN true if the user is a globalModerator
    return boardIds.filter(function(id) {
      var modded = ctrl.moderating.indexOf(id) > -1;
      if (modded) { return id; }
    }).length;
  };

  $timeout($anchorScroll);

  this.offLCS = $rootScope.$on('$locationChangeSuccess', function() {
    var params = $location.search();
    var page = Number(params.page) || undefined;
    var limit = Number(params.limit) || undefined;
    var modded = params.modded;
    var board = params.board;
    var search = params.search;

    var pageChanged = false;
    var limitChanged = false;
    var moddedChanged = false;
    var boardChanged = false;
    var searchChanged = false;

    if ((page === undefined || page) && page !== ctrl.page) {
      pageChanged = true;
      ctrl.page = page;
    }
    if (limit && limit !== ctrl.limit) {
      limitChanged = true;
      ctrl.limit = limit;
    }
    if ((modded === undefined || modded) && modded !== ctrl.modded) {
      moddedChanged = true;
      ctrl.modded = modded;
    }
    if ((board === undefined || board) && board !== ctrl.board) {
      boardChanged = true;
      ctrl.board = board;
    }
    if ((search === undefined || search) && search !== ctrl.search) {
      searchChanged = true;
      ctrl.search = search;
    }
    if (pageChanged || limitChanged || moddedChanged || boardChanged || searchChanged) { ctrl.pullPage(); }
  });
  $scope.$on('$destroy', function() { ctrl.offLCS(); });

  this.pullPage = function() {
    var query = {
      limit: ctrl.limit,
      page: ctrl.page || undefined,
      modded: ctrl.modded,
      board: ctrl.board,
      search: ctrl.search
    };

    AdminUsers.byBannedBoards(query).$promise
    .then(function(newBannedBoards) {
      ctrl.page = newBannedBoards.page;
      ctrl.limit = newBannedBoards.limit;
      ctrl.next = newBannedBoards.next;
      ctrl.prev = newBannedBoards.prev;
      ctrl.modded = newBannedBoards.modded;
      ctrl.board = newBannedBoards.board;
      ctrl.bannedBoards = newBannedBoards.data;
      ctrl.search = newBannedBoards.search;
      ctrl.searchActive = newBannedBoards.search ? true : false;
    });
  };
}];

module.exports = angular.module('ept.admin.moderation.boardBans.ctrl', [])
.controller('ModBoardBansCtrl', ctrl)
.name;
