var difference = require('lodash/difference');

var ctrl = ['$q', '$rootScope', '$scope', '$location', '$timeout', '$anchorScroll', 'Alert', 'Session', 'AdminUsers', 'bannedBoards', 'selectBoards', 'boards', function($q, $rootScope, $scope, $location, $timeout, $anchorScroll, Alert, Session, AdminUsers, bannedBoards, selectBoards, boards) {
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

  this.boards = boards;
  this.allBoards = selectBoards; // used to populate filter select
  this.moderating = Session.user.moderating;
  this.moderatedBoards = selectBoards.filter(function(board) {
    var modded = ctrl.moderating.indexOf(board.id) > -1;
    if (modded) { return board; }
  });
  if (ctrl.modded) { ctrl.selectBoards = ctrl.moderatedBoards; }
  else { ctrl.selectBoards = ctrl.allBoards; }

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

    // Banning Vars
  this.showManageBansModal = false; // manage ban modal visibility boolean
  this.banSubmitted = false; // form submitted bool
  this.selectedUser = null; //  model backing selected user
  this.confirmBanBtnLabel = 'Confirm'; // modal button label
  this.boardBanList = []; // model backing list of banned boards

  this.showManageBans = function(user) {
    ctrl.selectedUser = user;

    // Lookup users board bans
    // TODO: make sure user has permissions before doing this
    AdminUsers.getBannedBoards({ username: user.username }).$promise
    .then(function(bannedBoards) {
      // Names of boards the user is currently banned from
      ctrl.selectedUser.banned_board_names = bannedBoards.map(function(board) { return board.name; });
      // Model backing checklist tree of boards to ban user from
      ctrl.boardBanList = bannedBoards.map(function(board) { return board.id; });
      // Store bans that the user is currently banned from for diffing later
      ctrl.selectedUser.banned_board_ids = angular.copy(ctrl.boardBanList);
      ctrl.showManageBansModal = true;
    });
  };

  this.closeManageBans = function() {
    ctrl.selectedUser = null;
    ctrl.banUntil = null;
    ctrl.boardBanList = [];
    // Fix for modal not opening after closing
    $timeout(function() { ctrl.showManageBansModal = false; });
  };

  this.uncheckModBoards = function() {
    ctrl.moderating.forEach(function(id) {
      var index = ctrl.boardBanList.indexOf(id);
      if (index > -1) { ctrl.boardBanList.splice(index, 1); }
    });
  };

  this.checkModBoards = function() {
    ctrl.moderating.forEach(function(id) {
      var index = ctrl.boardBanList.indexOf(id);
      if (index < 0) { ctrl.boardBanList.push(id); }
    });
  };

  this.toggleBoardBan = function(boardId) {
    var index = ctrl.boardBanList.indexOf(boardId);
    if (index > -1) { ctrl.boardBanList.splice(index, 1); }
    else { ctrl.boardBanList.push(boardId); }
  };

  this.updateBans = function() {
    ctrl.confirmBanBtnLabel = 'Loading...';
    ctrl.banSubmitted = true;

    // Used for updating banned boards
    var banBoardParams = {
      user_id: ctrl.selectedUser.id,
      board_ids: difference(ctrl.boardBanList, ctrl.selectedUser.banned_board_ids)
    };
    // Used for updating unbanned boards
    var unbanBoardParams = {
      user_id: ctrl.selectedUser.id,
      board_ids: difference(ctrl.selectedUser.banned_board_ids, ctrl.boardBanList)
    };

    var promises = [];

    // User is being banned from new boards
    if (banBoardParams.board_ids.length) {
      promises.push(AdminUsers.banFromBoards(banBoardParams).$promise
        .then(function() {
          Alert.success(ctrl.selectedUser.username + ' has been banned from boards');
        })
        .catch(function(err) {
          var msg = 'There was an error banning ' + ctrl.selectedUser.username + ' from boards';
          if (err.status === 403) { msg = ctrl.selectedUser.username + ' has higher permissions, cannot ban from boards'; }
          Alert.error(msg);
        })
      );
    }
    // User is being unbanned from boards
    if (unbanBoardParams.board_ids.length) {
      promises.push(AdminUsers.unbanFromBoards(unbanBoardParams).$promise
        .then(function() {
          Alert.success(ctrl.selectedUser.username + ' has been unbanned from boards');
        })
        .catch(function(err) {
          var msg = 'There was an error unbanning ' + ctrl.selectedUser.username + ' from boards';
          if (err.status === 403) { msg = ctrl.selectedUser.username + ' has higher permissions, cannot unban from boards'; }
          Alert.error(msg);
        })
      );
    }

    $q.all(promises)
    .then(function() { ctrl.pullPage(); })
    .finally(function() {
      ctrl.closeManageBans();
      $timeout(function() { // wait for modal to close
        ctrl.confirmBanBtnLabel = 'Confirm';
        ctrl.banSubmitted = false;
      }, 500);
    });
  };

  $timeout($anchorScroll);

  this.offLCS = $rootScope.$on('$locationChangeSuccess', function() {
    var params = $location.search();
    var page = Number(params.page) || 1;
    var limit = Number(params.limit) || 25;
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
    if ((limit === undefined || limit) && limit !== ctrl.limit) {
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
