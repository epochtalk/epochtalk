var html = `<div class="profile-row profile-action">
    <a ng-show="vmMentionsProfile.user.ignoreMentions" ng-click="vmMentionsProfile.unignoreUser()">
      Unignore All Mentions By User
    </a>
    <a ng-hide="vmMentionsProfile.user.ignoreMentions" ng-click="vmMentionsProfile.ignoreUser()">
      Ignore All Mentions By User
    </a>
  </div>`;

var directive = ['Mentions', 'Alert', function(Mentions, Alert) {
  return {
    restrict: 'E',
    template: html,
    scope: true,
    bindToController: { user: '=' },
    controllerAs: 'vmMentionsProfile',
    controller: [function() {
      var ctrl = this;

      this.ignoreUser = function() {
        var username = ctrl.user.username;
        return Mentions.ignoreUser({ username: username }).$promise
        .then(function() {
          ctrl.user.ignoreMentions = true;
          Alert.success('You are now ignoring mentions from ' + username);
        })
        .catch(function() {
          Alert.error('There was an error ignoring mentions from ' + username + '. Please try again later.');
        });
      };

      this.unignoreUser = function() {
        var username = ctrl.user.username;
        return Mentions.unignoreUser({ username: username }).$promise
        .then(function() {
          ctrl.user.ignoreMentions = false;
          Alert.success('You stopped ignoring mentions from ' + username);
        })
        .catch(function() {
          Alert.error('There was an error unignoring mentions from ' + username + '. Please try again later.');
        });
      };

    }]
  };
}];


angular.module('ept').directive('mentionsIgnoreProfile', directive);
