var ctrl = ['$rootScope', '$scope', '$location', '$timeout', '$anchorScroll', 'AdminUsers', 'bannedBoards',  function($rootScope, $scope, $location, $timeout, $anchorScroll, AdminUsers, bannedBoards) {
  var ctrl = this;
  this.parent = $scope.$parent.ModerationCtrl;
  this.parent.tab = 'board-bans';

  this.search = null;
  this.page = bannedBoards.page;
  this.limit = bannedBoards.limit;
  this.next = bannedBoards.next;
  this.prev = bannedBoards.prev;
  this.modded = bannedBoards.modded;
  this.board = bannedBoards.board;
  this.bannedBoards = bannedBoards.data;

  // Call init

  $timeout($anchorScroll);

  this.offLCS = $rootScope.$on('$locationChangeSuccess', function() {
    var params = $location.search();
    var page = Number(params.page) || undefined;
    var limit = Number(params.limit) || undefined;
    var modded = params.modded;
    var board = params.board;

    var pageChanged = false;
    var limitChanged = false;
    var moddedChanged = false;
    var boardChanged = false;

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

    if (pageChanged || limitChanged || moddedChanged || boardChanged) { ctrl.pullPage(); }
  });
  $scope.$on('$destroy', function() { ctrl.offLCS(); });

  this.pullPage = function() {
    var query = {
      limit: ctrl.limit,
      page: ctrl.page || undefined,
      modded: ctrl.modded,
      board: ctrl.board
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
    });
  };
}];

module.exports = angular.module('ept.admin.moderation.boardBans.ctrl', [])
.controller('ModBoardBansCtrl', ctrl)
.name;
