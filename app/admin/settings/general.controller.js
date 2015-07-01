module.exports = ['$scope', 'settings', 'AdminSettings', 'Alert', function($scope, settings, AdminSettings, Alert) {
  var ctrl = this;

  // Tab control
  this.parent = $scope.$parent;
  this.parent.tab = 'general';

  // Make copy of settings for a restore state
  this.originalSettings = angular.copy(settings);
  this.settings = angular.copy(settings);

  // convert image storage type to a bool
  this.localImageServer = ctrl.originalSettings.images.storage === 'local';

  // Used to hide/show password fields
  this.showAccessKey = false;
  this.showSecretKey = false;
  this.showSmtpPass = false;

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
    ctrl.localImageServer = ctrl.originalSettings.images.storage === 'local';
  };
}];
