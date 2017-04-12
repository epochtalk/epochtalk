var ctrl = ['$rootScope', '$location', 'PreferencesSvc', '$stateParams', 'User', 'Alert', 'Session', 'user',
  function($rootScope, $location, PreferencesSvc, $stateParams, User, Alert, Session, user) {
    var ctrl = this;
    this.user = user;

    this.canUpdatePrefs = function() {
      return Session.hasPermission('users.update.allow');
    };

    // Preferences
    this.tempPreferences = {
      username: ctrl.user.username,
      posts_per_page: ctrl.user.posts_per_page,
      threads_per_page: ctrl.user.threads_per_page,
      collapsed_categories: ctrl.user.collapsed_categories
    };

    this.resetPrefrences = function() {
      ctrl.tempPreferences.posts_per_page = 25;
      ctrl.tempPreferences.threads_per_page = 25;
    };

    this.savePreferences = function() {
      return User.update({ id: ctrl.user.id }, ctrl.tempPreferences).$promise
      .then(function(data) {
        ctrl.user.posts_per_page = data.posts_per_page;
        ctrl.user.threads_per_page = data.threads_per_page;
      })
      .then(function() {
        var tempPref = PreferencesSvc.preferences;
        tempPref.posts_per_page = ctrl.user.posts_per_page;
        tempPref.threads_per_page = ctrl.user.threads_per_page;
        return PreferencesSvc.setPreferences(tempPref);
      })
      .then(function() { Alert.success('Successfully saved preferences'); })
      .catch(function() { Alert.error('Preferences could not be updated'); });
    };
  }
];

module.exports = angular.module('ept.settings.ctrl', [])
.controller('SettingsCtrl', ctrl)
.name;
