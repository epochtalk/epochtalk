var ctrl = ['$rootScope', '$location', 'PreferencesSvc', 'User', 'Alert', 'Session', 'boards', 'user',
  function($rootScope, $location, PreferencesSvc, User, Alert, Session, boards, user) {
    var ctrl = this;
    this.user = user;
    this.boards = boards;
    this.allBoards = {};
    this.toggleSubmitted = {};
    this.userPrefs = PreferencesSvc.preferences;

    this.canUpdatePrefs = function() { return Session.hasPermission('users.update.allow'); };

    this.resetPrefrences = function() {
      ctrl.userPrefs.posts_per_page = 25;
      ctrl.userPrefs.threads_per_page = 25;
    };

    function savePreferences() {
      ctrl.userPrefs.username = ctrl.user.username;
      return User.update({ id: ctrl.user.id }, ctrl.userPrefs).$promise
      .then(function() { return PreferencesSvc.setPreferences(ctrl.userPrefs); })
      .then(function() { Alert.success('Successfully saved preferences'); })
      .catch(function() { Alert.error('Preferences could not be updated'); });
    };
    this.savePreferences = savePreferences;

    this.toggleIgnoredBoard = function(boardId) {
      var index = ctrl.userPrefs.ignored_boards.indexOf(boardId);
      var oldIgnoredBoards = angular.copy(ctrl.userPrefs.ignored_boards);
      if (index > -1) { ctrl.userPrefs.ignored_boards.splice(index, 1); }
      else { ctrl.userPrefs.ignored_boards.push(boardId); }
      ctrl.userPrefs.username = ctrl.user.username;
      return User.update({ id: ctrl.user.id }, ctrl.userPrefs).$promise
      .then(function() { return PreferencesSvc.setPreferences(ctrl.userPrefs); })
      .catch(function() {
        ctrl.userPrefs.ignored_boards = oldIgnoredBoards;
        ctrl.allBoards[boardId] = !ctrl.allBoards[boardId];
        Alert.error('Preferences could not be updated');
      });
    };
  }
];

module.exports = angular.module('ept.settings.ctrl', [])
.controller('SettingsCtrl', ctrl)
.name;
