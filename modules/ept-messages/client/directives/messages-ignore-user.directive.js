var html = `<div class="profile-row profile-action">
    <a ng-show="vmMessagesProfile.user.ignoreMessages" ng-click="vmMessagesProfile.unignoreUser()">
      Unignore All Messages By User
    </a>
    <a ng-hide="vmMessagesProfile.user.ignoreMessages" ng-click="vmMessagesProfile.ignoreUser()">
      Ignore All Messages By User
    </a>
  </div>`;

var directive = ['Messages', 'Alert', function(Messages, Alert) {
  return {
    restrict: 'E',
    template: html,
    scope: true,
    bindToController: { user: '=' },
    controllerAs: 'vmMessagesProfile',
    controller: [function() {
      var ctrl = this;

      this.ignoreUser = function() {
        var username = ctrl.user.username;
        return Messages.ignoreUser({ username: username }).$promise
        .then(function() {
          ctrl.user.ignoreMessages = true;
          Alert.success('You are now ignoring messages from ' + username);
        })
        .catch(function() {
          Alert.error('There was an error ignoring messages from ' + username + '. Please try again later.');
        });
      };

      this.unignoreUser = function() {
        var username = ctrl.user.username;
        return Messages.unignoreUser({ username: username }).$promise
        .then(function() {
          ctrl.user.ignoreMessages = false;
          Alert.success('You stopped ignoring messages from ' + username);
        })
        .catch(function() {
          Alert.error('There was an error unignoring messages from ' + username + '. Please try again later.');
        });
      };

    }]
  };
}];


angular.module('ept').directive('messagesIgnoreProfile', directive);
