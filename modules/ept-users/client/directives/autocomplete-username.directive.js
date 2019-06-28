var directive = ['User', 'User', function(User, User) {
  return {
    restrict: 'E',
    template: require('./autocomplete-username.html'),
    scope: {
      buttonText: '@',
      inputPlaceholder: '@',
      buttonAction: '&'
    },
    controller: ['$scope', function($scope) {
      $scope.usernameSearchResults = [];
      $scope.usernameIsValid = false;

      $scope.performAction = function() {
        if (!$scope.usernameIsValid) { return; }
        User.get({ id: $scope.searchStr }).$promise
        .then(function(user) {
          $scope.buttonAction({ user: user });
          $scope.searchStr = null;
        });
      };

      $scope.$watch('searchStr', function() {
        $scope.usernameIsValid = false;
        if (!$scope.searchStr || !$scope.searchStr.length) { return; }
        $scope.usernameSearchResults = [];
        User.searchUsernames({ username: $scope.searchStr }).$promise
        .then(function(usernames) {
          $scope.usernameSearchResults = usernames;
          // ignore casing
          for (var i = 0; i < usernames.length; i++) {
            var lowerCasedUsername = usernames[i].toLowerCase();
            if (lowerCasedUsername === $scope.searchStr.toLowerCase()) {
              $scope.usernameIsValid = true;
              break;
            }
          }
        });
      });
    }]
  };
}];

module.exports = angular.module('ept.directives.autocomplete-username', [])
.directive('autocompleteUsername', directive);
