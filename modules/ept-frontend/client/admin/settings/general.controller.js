var ctrl = ['$scope', '$filter', 'settings', 'Configurations', 'Boards', 'Alert', function($scope, $filter, settings, Configurations, Boards, Alert) {
  var ctrl = this;

  // Tab control
  this.parent = $scope.$parent.AdminSettingsCtrl;
  this.parent.tab = 'general';

  // This page has no validation
  $scope.child.invalidForm = false;

  // Make copy of settings for a restore state
  this.originalSettings = angular.copy(settings);
  this.settings = angular.copy(settings);

  // convert image storage type to a bool
  this.localImageServer = ctrl.originalSettings.images.storage === 'local';

  // Used to hide/show password fields
  this.showAccessKey = false;
  this.showSecretKey = false;
  this.showSmtpPass = false;

  // get boards for portal select
  this.boards = [];
  function getBoards() {
    return Boards.moveList().$promise
    .then(function(allBoards) {
      ctrl.boards = allBoards || [];
      ctrl.boards.map(function(board) {
        board.name = $filter('decode')(board.name); // decode html entities
      });
    });
  }
  getBoards();

  // Save action
  $scope.child.save = function() {
    Configurations.update(ctrl.settings).$promise
    .then(function() {
      Alert.success('Successfully saved settings');
      ctrl.originalSettings = angular.copy(ctrl.settings);
      $scope.child.saveSettings();
    })
    .catch(function(err) {
      if (err.status === 422) { Alert.error(err.data.message); }
      else { Alert.error('Error saving setting'); }
    });
  };

  // Reset action
  $scope.child.reset = function() {
    ctrl.settings = angular.copy(ctrl.originalSettings);
    ctrl.localImageServer = ctrl.originalSettings.images.storage === 'local';
  };
}];

require('../../components/image_uploader/image_uploader.directive');

module.exports = angular.module('ept.admin.settings.general.ctrl', [])
.controller('GeneralSettingsCtrl', ctrl);
