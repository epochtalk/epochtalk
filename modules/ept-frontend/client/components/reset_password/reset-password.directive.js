var directive = ['Authorization', 'Session', 'Alert',
function(Authorization, Session, Alert) {
  return {
    restrict: 'E',
    scope: true,
    bindToController: { user: '=' },
    template: '<div class="profile-row profile-action" ng-if="rsvm.canReset()"><a ng-click="rsvm.reset()">Reset Password</a></div>',
    controllerAs: 'rsvm',
    controller: [function() {
      // Permissions
      this.canReset = function() {
        var isAuthed = Session.isAuthenticated();
        var hasPermission = Session.hasPermission('adminUsers.resetPassword');

        if (isAuthed && hasPermission) { return true; }
        else { return false; }
      };

      // Reset Password
      this.reset = function() {
        Authorization.adminRecoverAccount({ user_id: this.user.id }).$promise
        .then(function() { Alert.success('Password Reset Email Sent'); })
        .catch(function() { Alert.error('Error resetting password'); });
      };

    }]
  };
}];

module.exports = angular.module('ept.directives.resetPassword', [])
.directive('resetPassword', directive);
