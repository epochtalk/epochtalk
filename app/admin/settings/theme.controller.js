var ctrl = ['$scope', '$window', '$timeout', 'settings', 'theme', 'AdminSettings', 'Alert', function($scope, $window, $timeout, settings, theme, AdminSettings, Alert) {
  var ctrl = this;

  // Tab control
  this.parent = $scope.$parent.AdminSettingsCtrl;
  this.parent.tab = 'theme';

  // Rename reset butotn
  $scope.child.resetBtnLabel = 'Default Theme';

  // Theme Model
  this.theme = theme;

  // Remove px and rem
  this.theme['base-font-size'] = this.theme['base-font-size'].split('px')[0];
  this.theme['base-line-height'] = this.theme['base-line-height'].split('rem')[0];

  // Tell parent controller form validity
  $scope.$watch('themeForm.$invalid', function(invalid) {
    $scope.child.invalidForm = invalid;
  });

  // Save action
  $scope.child.save = function() {
    // Add px and rem
    var updatedTheme = angular.copy(ctrl.theme);
    updatedTheme['base-font-size'] = updatedTheme['base-font-size'] + 'px';
    updatedTheme['base-line-height'] = updatedTheme['base-line-height'] + 'rem';

    // Update
    AdminSettings.setTheme(updatedTheme).$promise
    .then(function() {
      Alert.success('Theme successfully updated, reloading in 3 seconds');
      $timeout(function() { $window.location.reload(); }, 3000);
    })
    .catch(function() { Alert.error('There was an error setting the theme'); });
  };

  // Reset action
  $scope.child.reset = function() {
    AdminSettings.resetTheme().$promise
    .then(function() {
      Alert.success('Theme successfully reset, reloading in 3 seconds.');
      $timeout(function() { $window.location.reload(); }, 3000);
    })
    .catch(function() { Alert.error('There was an error resetting the theme'); });
  };
}];

module.exports = angular.module('ept.admin.settings.theme.ctrl', [])
.controller('ThemeSettingsCtrl', ctrl)
.name;
