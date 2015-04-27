module.exports = ['$scope', 'settings', 'Settings', function($scope, settings, Settings) {
  var ctrl = this;
  this.parent = $scope.$parent;
  this.parent.tab = 'general';
  this.localImageServer = settings.images.storage === 'local';
  // Remove unsettable configs
  delete settings.db;
  delete settings.rootDir;
  this.originalSettings = angular.copy(settings);
  this.settings = settings;

  this.showAccessKey = false;
  this.showSecretKey = false;
  this.showSmtpPass = false;

  $scope.child.save = function() {
    Settings.update(ctrl.settings).$promise
    .then(function() {
      // success
      console.log('save successful');
    })
    .catch(function(err) {
      console.log(err);
    });
  };

  $scope.child.reset = function() {
    ctrl.settings = angular.copy(ctrl.originalSettings);
  };
}];
