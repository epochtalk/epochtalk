var directive = ['UserTrust', 'Boards', '$timeout', function(UserTrust, Boards, $timeout) {
  return {
    restrict: 'E',
    scope: true,
    template: require('./trustAdminSettings.html'),
    controllerAs: 'vm',
    controller: [function() {
      var ctrl = this;
      this.boards = null;
      this.trustBoards = [];
      this.allBoards = {};

      $timeout(function() {
        Boards.query({ stripped: true }).$promise
        .then(function(data) { ctrl.boards = data.boards; });
      });

      $timeout(function() {
        UserTrust.getTrustBoards().$promise
        .then(function(trustBoards) { ctrl.trustBoards = trustBoards; });
      });

      this.toggleSubmitted = {};
      this.toggleBoardTrust = function(boardId) {
        ctrl.toggleSubmitted[boardId] = true;
        var index = ctrl.trustBoards.indexOf(boardId);
        if (index > -1) {
          return UserTrust.deleteTrustBoard({ board_id: boardId }).$promise
          .then(function() {
            ctrl.trustBoards.splice(index, 1);
            ctrl.allBoards[boardId] = false;
          })
          .catch(function() { ctrl.allBoards[boardId] = !ctrl.allBoards[boardId]; })
          .finally(function() { delete ctrl.toggleSubmitted[boardId]; });
        }
        else {
          return UserTrust.addTrustBoard({ board_id: boardId }).$promise
          .then(function() {
            ctrl.trustBoards.push(boardId);
            ctrl.allBoards[boardId] = true;
          })
          .catch(function() { ctrl.allBoards[boardId] = !ctrl.allBoards[boardId]; })
          .finally(function() { delete ctrl.toggleSubmitted[boardId]; });
        }
      };
    }]
  };
}];


angular.module('ept').directive('trustAdminSettings', directive);


