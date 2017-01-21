var ctrl = ['$scope', 'text', 'AdminLegal', 'Alert', function($scope, text, AdminLegal, Alert) {
  var ctrl = this;

  // Tab control
  this.parent = $scope.$parent.AdminSettingsCtrl;
  this.parent.tab = 'legal';

  // This page has no validation
  $scope.child.invalidForm = false;

  this.text = angular.copy(text);

  // Save action
  $scope.child.save = function() {
    AdminLegal.update(ctrl.text).$promise
    .then(function() { Alert.success('Successfully saved legal text'); })
    .catch(function() { Alert.error('Legal text could not be saved'); });
  };

  // Reset action
  $scope.child.reset = function() {
    AdminLegal.reset().$promise
    .then(function(text) { ctrl.text = text; })
    .then(function() { Alert.success('Successfully reset legal text'); });
  };
}];

module.exports = angular.module('ept.admin.settings.legal.ctrl', [])
.controller('LegalSettingsCtrl', ctrl);
