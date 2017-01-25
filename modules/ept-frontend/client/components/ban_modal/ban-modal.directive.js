var difference = require('lodash/difference');

var directive = ['$q', '$filter', '$timeout', 'Session', 'Alert', 'Bans', 'Boards', function($q, $filter, $timeout, Session, Alert, Bans, Boards) {
  return {
    restrict: 'E',
    scope: true,
    bindToController: {
      showModal: '=',
      selectedUser: '=',
      callback: '=',
      disableBoardBans: '='
    },
    template: require('./ban-modal.html'),
    controllerAs: 'vmBan',
    controller: ['$scope', function($scope) {
      var ctrl = this;
      this.authedUser = Session.user;
      this.allBoardIds = []; // populated by init of inputs
      // Banning Vars
      this.showManageBansModal = false; // manage ban modal visibility boolean
      this.banSubmitted = false; // form submitted bool
      this.selectedUser = null; //  model backing selected user
      this.confirmBanBtnLabel = 'Confirm'; // modal button label
      this.permanentBan = undefined; // boolean indicating if ban is permanent
      this.banUntil = null; // model backing temporary ban date
      this.boardBanList = []; // model backing list of banned boards
      this.showIpBan = true; // Boolean which hides/shows ip ban checkbox
      this.banUserIp = false; // Model backing ip ban checkbox

      this.boards = null;

      this.minDate = function() {
        var d = new Date();
        var month = '' + (d.getMonth() + 1);
        var day = '' + d.getDate();
        var year = d.getFullYear();
        if (month.length < 2) { month = '0' + month; }
        if (day.length < 2) { day = '0' + day; }
        return [year, month, day].join('-');
      };

      if (!ctrl.disableBoardBans) {
        Boards.query({ stripped: true }).$promise
        .then(function(data) { ctrl.boards = data.boards; });
      }

      $scope.$watch(function() { return ctrl.showModal; }, function(val) {
          if (val) {

            // Pre select Global ban type radio button if the user is banned
            if (ctrl.selectedUser.ban_expiration) {
              var maxDate = new Date(8640000000000000);
              var banDate = new Date(ctrl.selectedUser.ban_expiration);
              ctrl.permanentBan = banDate.getTime() === maxDate.getTime();
              if (ctrl.permanentBan) { ctrl.showIpBan = false; }
              ctrl.banUntil = ctrl.permanentBan ? undefined : banDate;
              ctrl.selectedUser.permanent_ban = ctrl.banUntil ? false : true;
            }

            // Lookup users board bans
            // TODO: make sure user has permissions before doing this
            if (!ctrl.disableBoardBans) {
              Bans.getBannedBoards({ username: ctrl.selectedUser.username }).$promise
              .then(function(bannedBoards) {
                // Names of boards the user is currently banned from
                ctrl.selectedUser.banned_board_names = bannedBoards.map(function(board) { return board.name; });
                // Model backing checklist tree of boards to ban user from
                ctrl.boardBanList = bannedBoards.map(function(board) { return board.id; });
                // Store bans that the user is currently banned from for diffing later
                ctrl.selectedUser.banned_board_ids = angular.copy(ctrl.boardBanList);
              });
            }
          }
        }
      );

      this.canGlobalBanUser = function() {
        var loggedIn = Session.isAuthenticated();
        var banPermission = Session.hasPermission('bans.privilegedBan');
        if (loggedIn && banPermission) { return true; }
        else { return false; }
      };

      this.canBoardBanUser = function(boardId) {
        var loggedIn = Session.isAuthenticated();
        if (!loggedIn) { return; }
        var moderatingBoard = ctrl.authedUser.moderating.indexOf(boardId) >= 0;
        var banAllBoardsPermission = Session.hasPermission('bans.privilegedBanFromBoards.all');
        if (moderatingBoard || banAllBoardsPermission) { return true; }
        else { return false; }
      };

      this.loadBoardBans = function(boardId) {
        var banAllBoardsPermission = Session.hasPermission('bans.privilegedBanFromBoards.all');
        if (banAllBoardsPermission && ctrl.allBoardIds.indexOf(boardId) < 0) {
          ctrl.allBoardIds.push(boardId);
        }
      };

      this.uncheckModBoards = function() {
        var banBoardsPermission = Session.hasPermission('bans.privilegedBanFromBoards.all');
        if (banBoardsPermission) { ctrl.boardBanList = []; }
        else {
          ctrl.authedUser.moderating.forEach(function(id) {
            var index = ctrl.boardBanList.indexOf(id);
            if (index > -1) { ctrl.boardBanList.splice(index, 1); }
          });
        }
      };

      this.checkModBoards = function() {
        var banBoardsPermission = Session.hasPermission('bans.privilegedBanFromBoards.all');
        if (banBoardsPermission) { ctrl.boardBanList = ctrl.allBoardIds; }
        else {
          ctrl.authedUser.moderating.forEach(function(id) {
            var index = ctrl.boardBanList.indexOf(id);
            if (index < 0) { ctrl.boardBanList.push(id); }
          });
        }
      };

      this.toggleBoardBan = function(boardId) {
        var index = ctrl.boardBanList.indexOf(boardId);
        if (index > -1) { ctrl.boardBanList.splice(index, 1); }
        else { ctrl.boardBanList.push(boardId); }
      };

      this.closeManageBans = function() {
        ctrl.selectedUser = null;
        ctrl.permanentBan = undefined;
        ctrl.banUntil = null;
        ctrl.boardBanList = [];
        ctrl.showIpBan = true;
        ctrl.banUserIp = false;
        // Fix for modal not opening after closing
        $timeout(function() { ctrl.showModal = false; });
      };

      this.updateBans = function() {
        ctrl.confirmBanBtnLabel = 'Loading...';
        ctrl.banSubmitted = true;
        // Used to update reports in table
        var results = {
          user_id: ctrl.selectedUser.id,
          board_banned: ctrl.boardBanList.length > 0
        };
        // Used for updating global bans
        var globalBanParams = {
          user_id: ctrl.selectedUser.id,
          expiration: ctrl.permanentBan ? undefined : ctrl.banUntil,
          ip_ban: ctrl.permanentBan && ctrl.banUserIp ? true : undefined
        };
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

        // Ban diffing variables
        var newBanIsTemp = ctrl.permanentBan === false && ctrl.banUntil;
        var newBanIsPerm = ctrl.permanentBan;
        var newBanIsRemoved = ctrl.permanentBan === undefined;
        var oldBanIsTemp = ctrl.selectedUser.permanent_ban === false;
        var oldBanIsPerm = ctrl.selectedUser.permanent_ban;
        var userWasntBanned = ctrl.selectedUser.permanent_ban === undefined;

        // Check if user wasn't banned and is now banned, or the ban type changed
        var userBanned = (newBanIsTemp && (oldBanIsPerm || userWasntBanned)) || (newBanIsPerm && (oldBanIsTemp || userWasntBanned));
        // Check if user was banned previously and is now unbanned
        var userUnbanned = newBanIsRemoved && (oldBanIsTemp || oldBanIsPerm);

        var promises = [];
        // User is being banned globally either permanently or temporarily
        if (userBanned) {
          promises.push(Bans.ban(globalBanParams).$promise
            .then(function(banInfo) {
              Alert.success(ctrl.selectedUser.username + ' has been globally banned ' + (ctrl.permanentBan ? 'permanently' : ' until ' + $filter('humanDate')(ctrl.banUntil, true)));
              results = banInfo;
            })
            .catch(function(err) {
              results.banError = err;
              var msg = 'There was an error globally banning ' + ctrl.selectedUser.username;
              if (err.status === 403) { msg = ctrl.selectedUser.username + ' has higher permissions than you, cannot globally ban'; }
              Alert.error(msg);
            })
          );
        }
        // User is being unbanned globally, ensure user is currently banned
        else if (userUnbanned) {
          promises.push(Bans.unban(globalBanParams).$promise
            .then(function(unbanInfo) {
              Alert.success(ctrl.selectedUser.username + ' has been globally unbanned');
              results = unbanInfo;
            })
            .catch(function(err) {
              results.banError = err;
              var msg = 'There was an error globally unbanning ' + ctrl.selectedUser.username;
              if (err.status === 403) { msg = ctrl.selectedUser.username + ' has higher permissions, cannot globally unban'; }
              Alert.error(msg);
            })
          );
        }
        // User is being banned from new boards
        if (banBoardParams.board_ids.length) {
          promises.push(Bans.banFromBoards(banBoardParams).$promise
            .then(function() {
              Alert.success(ctrl.selectedUser.username + ' has been banned from boards');
            })
            .catch(function(err) {
              results.boardBanError = err;
              var msg = 'There was an error banning ' + ctrl.selectedUser.username + ' from boards';
              if (err.status === 403) { msg = ctrl.selectedUser.username + ' has higher permissions, cannot ban from boards'; }
              Alert.error(msg);
            })
          );
        }
        // User is being unbanned from boards
        if (unbanBoardParams.board_ids.length) {
          promises.push(Bans.unbanFromBoards(unbanBoardParams).$promise
            .then(function() {
              Alert.success(ctrl.selectedUser.username + ' has been unbanned from boards');
            })
            .catch(function(err) {
              results.boardBanError = err;
              var msg = 'There was an error unbanning ' + ctrl.selectedUser.username + ' from boards';
              if (err.status === 403) { msg = ctrl.selectedUser.username + ' has higher permissions, cannot unban from boards'; }
              Alert.error(msg);
            })
          );
        }

        $q.all(promises)
        .then(function() { ctrl.callback(results); })
        .finally(function() {
          ctrl.closeManageBans();
          $timeout(function() { // wait for modal to close
            ctrl.confirmBanBtnLabel = 'Confirm';
            ctrl.banSubmitted = false;
          }, 500);
        });
      };

    }]
  };
}];

module.exports = angular.module('ept.directives.ban-modal', [])
.directive('banModal', directive);
