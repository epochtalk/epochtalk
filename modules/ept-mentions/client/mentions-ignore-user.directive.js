var html = `<div class="profile-row profile-action">
    <a ng-show="vmMentionsProfile.userIsIgnored" ng-click="vmMentionsProfile.unignoreUser()">
      Unignore Mentions
    </a>
    <a ng-hide="vmMentionsProfile.userIsIgnored" ng-click="vmMentionsProfile.ignoreUser()">
      Ignore Mentions
    </a>
  </div>`;

var directive = ['$stateParams', 'Mentions', 'Alert', function($stateParams, Mentions, Alert) {
  return {
    restrict: 'E',
    template: html,
    scope: true,
    controllerAs: 'vmMentionsProfile',
    controller: [function() {
      var ctrl = this;
      this.userIsIgnored = false;

      Mentions.getUserIgnored({ username: $stateParams.username }).$promise
      .then(function(user) { ctrl.userIsIgnored = user.ignored; });

      this.ignoreUser = function() {
        var username = $stateParams.username;
        return Mentions.ignoreUser({ username: username }).$promise
        .then(function() {
          ctrl.userIsIgnored = true;
          Alert.success('You are now ignoring mentions from ' + username);
        })
        .catch(function() {
          Alert.success('There was an error ignoring mentions from ' + username + '. Please try again later.');
        });
      };

      this.unignoreUser = function() {
        var username = $stateParams.username;
        return Mentions.unignoreUser({ username: username }).$promise
        .then(function() {
          ctrl.userIsIgnored = false;
          Alert.success('You stopped ignoring mentions from ' + username);
        })
        .catch(function() {
          Alert.success('There was an error unignoring mentions from ' + username + '. Please try again later.');
        });
      };

    }]
  };
}];


angular.module('ept').directive('mentionsIgnoreProfile', directive);
