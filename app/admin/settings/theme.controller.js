var ctrl = ['$scope', '$window', '$timeout', 'settings', 'theme', 'AdminSettings', 'Alert', function($scope, $window, $timeout, settings, theme, AdminSettings, Alert) {
  var ctrl = this;

  // Tab control
  this.parent = $scope.$parent.AdminSettingsCtrl;
  this.parent.tab = 'theme';

  this.theme = theme;

  // Save action
  $scope.child.save = function() {
    AdminSettings.setTheme(ctrl.theme).$promise
    .then(function() {
      Alert.success('Theme successfully updated, reloading in 3 seconds.');
      $timeout(function() { $window.location.reload(); }, 3000);
    })
    .catch(function(err) { Alert.error(err); });
  };

  // Reset action
  $scope.child.reset = function() {
  };
}];

module.exports = angular.module('ept.admin.settings.theme.ctrl', [])
.controller('ThemeSettingsCtrl', ctrl)
.name;
