module.exports = ['$scope', 'settings', 'Settings', function($scope, settings, Settings) {
  var ctrl = this;

  // Tab control
  this.parent = $scope.$parent;
  this.parent.tab = 'general';

  // convert image storage type to a bool
  this.localImageServer = settings.images.storage === 'local';

  // Make copy of settings for a restore state
  this.originalSettings = angular.copy(settings);
  this.settings = settings;

  // Used to hide/show password fields
  this.showAccessKey = false;
  this.showSecretKey = false;
  this.showSmtpPass = false;

  // Save action
  $scope.child.save = function() {
    Settings.save(ctrl.settings).$promise
    .then(function() { ctrl.originalSettings = angular.copy(ctrl.settings); })
    .catch(function(err) { console.log(err); });
  };

  // Reset action
  $scope.child.reset = function() {
    ctrl.settings = angular.copy(ctrl.originalSettings);
  };
}];
