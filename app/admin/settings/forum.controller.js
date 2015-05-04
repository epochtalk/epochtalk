module.exports = ['$scope', 'settings', 'AdminSettings', function($scope, settings, AdminSettings) {
  var ctrl = this;

  // Tab control
  this.parent = $scope.$parent;
  this.parent.tab = 'forum';

  // Make copy of settings for a restore state
  this.originalSettings = angular.copy(settings);
  this.settings = settings;

  // Save action
  $scope.child.save = function() {
    AdminSettings.save(ctrl.settings).$promise
    .then(function() { ctrl.originalSettings = angular.copy(ctrl.settings); })
    .catch(function(err) { console.log(err); });
  };

  // Reset action
  $scope.child.reset = function() {
    ctrl.settings = angular.copy(ctrl.originalSettings);
    ctrl.localImageServer = ctrl.settings.images.storage === 'local';
  };
}];
