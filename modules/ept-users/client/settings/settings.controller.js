var ctrl = ['$rootScope', '$location', 'PreferencesSvc', 'User', 'Alert', 'Session', 'boards', 'user',
  function($rootScope, $location, PreferencesSvc, User, Alert, Session, boards, user) {
    var ctrl = this;
    this.user = user;
    this.boards = boards;
    this.ignoredBoards = [];
    this.allBoards = {};
    this.toggleSubmitted = {};

    this.canUpdatePrefs = function() {
      return Session.hasPermission('users.update.allow');
    };

    this.userPrefs = PreferencesSvc.preferences;

    this.resetPrefrences = function() {
      ctrl.userPrefs.posts_per_page = 25;
      ctrl.userPrefs.threads_per_page = 25;
    };

    this.savePreferences = function() {
      ctrl.userPrefs.username = ctrl.user.username;
      return User.update({ id: ctrl.user.id }, ctrl.userPrefs).$promise
      .then(function() { return PreferencesSvc.setPreferences(ctrl.userPrefs); })
      .then(function() { Alert.success('Successfully saved paging preferences'); })
      .catch(function() { Alert.error('Paging preferences could not be updated'); });
    };
  }
];

this.toggleBoardTrust = function(boardId) {
  // TODO
};

module.exports = angular.module('ept.settings.ctrl', [])
.controller('SettingsCtrl', ctrl)
.name;
