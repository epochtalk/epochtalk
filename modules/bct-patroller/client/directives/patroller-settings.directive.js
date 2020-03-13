var directive = ['PreferencesSvc', 'User', 'Session', function(PreferencesSvc, User, Session) {
  return {
    restrict: 'E',
    scope: true,
    template: require('./patroller-settings.directive.html'),
    controllerAs: 'vmPatroller',
    controller: ['Alert', '$timeout', function(Alert, $timeout) {
      var ctrl = this;
      this.userPrefs = angular.copy(PreferencesSvc.preferences);
      this.patrollerDisabled = this.userPrefs.patroller_view;
      this.loggedIn = Session.isAuthenticated;
      // patrollerDisabled is inverted due to weirdness with ng-model and
      // the delay it takes for the switch to toggle off
      this.enablePatroller = function() {
        ctrl.userPrefs.username = Session.user.username;
        ctrl.userPrefs.patroller_view = !ctrl.patrollerDisabled;
        return User.update({ id:  Session.user.id }, ctrl.userPrefs).$promise
        .then(function() { return PreferencesSvc.setPreferences(ctrl.userPrefs); })
        .then(function() { Alert.success('Successfully saved preferences'); })
        .catch(function() {
          ctrl.patrollerDisabled = !ctrl.patrollerDisabled;
          Alert.error('Preferences could not be updated');
        });
      };

      this.isVisible = function() {
        var visible = false;
        var loggedIn = Session.isAuthenticated();
        // If you have the patroller role, the view is automatically visible
        if (loggedIn) {
          visible = true;
          Session.user.roles.map(function(role) {
            if (role === 'patroller') { visible = false; }
          });
        }
        return visible;
      };

    }]
  };
}];


angular.module('ept').directive('patrollerSettings', directive);
