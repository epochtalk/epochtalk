var ctrl = ['$scope', '$state', '$timeout', 'theme', 'Themes', 'Alert', 'ThemeSVC', function($scope, $state, $timeout, theme, Themes, Alert, ThemeSVC) {
  var ctrl = this;

  // Tab control
  this.parent = $scope.$parent.AdminSettingsCtrl;
  this.parent.tab = 'theme';

  // Theme Model
  this.theme = theme;

  // Theme copy
  this.themeCopy = null;

  // Remove px and rem
  this.removeVarPostFix = function() {
    ctrl.theme['base-font-size'] = ctrl.theme['base-font-size'].split('px')[0];
    ctrl.theme['base-line-height'] = ctrl.theme['base-line-height'].split('rem')[0];
  };

  // Remove px and rem from theme model on load
  this.removeVarPostFix();

  // Add px and rem
  this.addVarPostFix = function() {
    ctrl.themeCopy = angular.copy(ctrl.theme);
    ctrl.themeCopy['base-font-size'] = ctrl.themeCopy['base-font-size'] + 'px';
    ctrl.themeCopy['base-line-height'] = ctrl.themeCopy['base-line-height'] + 'rem';
  };

  // Tell parent controller form validity
  $scope.$watch('themeForm.$invalid', function(invalid) {
    $scope.child.invalidForm = invalid;
  });

  $scope.$watch('themeForm.$pristine', function(pristine) {
    $scope.child.pristineForm = pristine;
  });

  $scope.child.preview = function() {
    // Add px and rem back
    ctrl.addVarPostFix();

    // Load Preview Model into Theme Service
    ThemeSVC.setTheme(ctrl.themeCopy);

    // Update
    Themes.previewTheme(ctrl.themeCopy).$promise
    .then(function(previewTheme) {
      ctrl.theme = previewTheme;
      ctrl.removeVarPostFix();
      Alert.success('Previewing theme locally');
      $scope.themeForm.$setPristine();
      ThemeSVC.toggleCSS(true);
    })
    .catch(function() { Alert.error('There was an error previewing the theme'); });
  };

  // Save action
  $scope.child.save = function() {
    // Add px and rem back
    ctrl.addVarPostFix();
    // Update
    Themes.setTheme(ctrl.themeCopy).$promise
    .then(function(updatedTheme) {
      ctrl.theme = updatedTheme;
      ctrl.removeVarPostFix();
      Alert.success('Theme successfully updated');
      ThemeSVC.toggleCSS(false);
    })
    .catch(function() { Alert.error('There was an error setting the theme'); });
  };

  // Reset action
  $scope.child.reset = function() {
    $state.go($state.current, { preview: undefined }, { reload: true });
  };

  // revert action
  this.revert = function() {
    Themes.resetTheme().$promise
    .then(function(resetTheme) {
      ctrl.theme = resetTheme;
      ctrl.removeVarPostFix();
      Alert.success('Theme successfully reset to default');
      ThemeSVC.toggleCSS(false);
    })
    .catch(function() { Alert.error('There was an error reverting to the default theme'); });
  };
}];

// include the color validator directive
require('../../components/color_validator/color-validator.directive');

module.exports = angular.module('ept.admin.settings.theme.ctrl', [])
.controller('ThemeSettingsCtrl', ctrl);
