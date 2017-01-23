var html= '<div ng-if="vm.canIgnore() || vm.canUnignore()" class="profile-row profile-action">';
html += '<a ng-if="vm.canIgnore()" ng-click="vm.ignore()">Ignore This User</a>';
html += '<a ng-if="vm.canUnignore()" ng-click="vm.unignore()">Unignore This User</a>';
html += '</div>';

var directive = ['IgnoreUsers', 'Session', 'Alert', '$state',
  function(IgnoreUsers, Session, Alert, $state) {
  return {
    restrict: 'E',
    scope: true,
    bindToController: { user: '=' },
    template: html,
    controllerAs: 'vm',
    controller: [function() {
      var ctrl = this;

      this.Session = Session;
      this.sessionUser = Session.user;

      this.canIgnore = function() {
        var valid = true;
        if (!Session.isAuthenticated()) { valid = false; }
        if (ctrl.user.id === ctrl.sessionUser.id) { valid = false; }
        if (ctrl.user._ignored) { valid = false; }
        return valid;
      };

      this.canUnignore = function() {
        var valid = true;
        if (!Session.isAuthenticated()) { valid = false; }
        if (ctrl.user.id === ctrl.sessionUser.id) { valid = false; }
        if (!ctrl.user._ignored) { valid = false; }
        return valid;
      };

      this.ignore = function() {
        return IgnoreUsers.ignore({userId: ctrl.user.id}).$promise
        .then(function() { Alert.success('Ignoring ' + ctrl.user.username); })
        .then(function() { $state.go($state.$current, null, {reload:true}); })
        .catch(function(){ Alert.error('Error trying to ignore user.'); });
      };

      this.unignore = function() {
        return IgnoreUsers.unignore({userId: ctrl.user.id}).$promise
        .then(function() { Alert.success('No longer ignoring ' + ctrl.user.username); })
        .then(function() { $state.go($state.$current, null, {reload:true}); })
        .catch(function(){ Alert.error('Error trying to stop ignoring user.'); });
      };
    }]
  };
}];


angular.module('ept').directive('ignoreUserProfile', directive);
