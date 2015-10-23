var ctrl = ['$scope', 'settings', 'AdminSettings', 'Alert', function($scope, settings, AdminSettings, Alert) {
  var ctrl = this;

  // Tab control
  this.parent = $scope.$parent.AdminSettingsCtrl;
  this.parent.tab = 'forum';

  // Make copy of settings for a restore state
  this.originalSettings = angular.copy(settings);
  this.settings = angular.copy(settings);

  // Save action
  $scope.child.save = function() {
    AdminSettings.save(ctrl.settings).$promise
    .then(function() {
      Alert.success('Successfully saved settings');
      ctrl.originalSettings = angular.copy(ctrl.settings);
    })
    .catch(function() { Alert.error('Settings could not be updated'); });
  };

  // Reset action
  $scope.child.reset = function() {
    ctrl.settings = angular.copy(ctrl.originalSettings);
    ctrl.localImageServer = ctrl.settings.images.storage === 'local';
  };
}];

module.exports = angular.module('ept.admin.settings.forum.ctrl', [])
.controller('ForumSettingsCtrl', ctrl)
.name;
