var ctrl = ['$location', 'Alert', 'UserTrust', 'Session', 'trustTree', function($location, Alert, UserTrust, Session, trustTree) {
    var ctrl = this;
    this.settingsUsername = Session.user.username;
    this.trustTree = trustTree;
    this.hierarchy = $location.search().hierarchy;

    this.trustListCallback = function() {
      return UserTrust.getTrustTree({ hierarchy: ctrl.hierarchy }).$promise
      .then(function(updatedTree) { ctrl.trustTree = updatedTree; });
    };

    this.changeTrustView = function() {
      ctrl.hierarchy = !ctrl.hierarchy;
      $location.search('hierarchy', ctrl.hierarchy ? 'true' : undefined);
      return UserTrust.getTrustTree({ hierarchy: ctrl.hierarchy }).$promise
      .then(function(updatedTree) { ctrl.trustTree = updatedTree; });
    };

  }
];


module.exports = angular.module('bct.trustSettings.ctrl', [])
.controller('TrustSettingsCtrl', ctrl)
.name;
