var fs = require('fs');
var path = require('path');

module.exports = ['AdminUsers', function(AdminUsers) {
  return {
    restrict: 'E',
    template: fs.readFileSync(path.normalize(__dirname + '/autocomplete-username.html')),
    scope: {
      buttonText: '@',
      inputPlaceholder: '@',
      buttonAction: '&'
    },
    controller: function($scope) {
      $scope.usernameSearchResults = [];
      $scope.usernameIsValid = false;

      $scope.performAction = function() {
        AdminUsers.get({username: $scope.searchStr }).$promise
        .then(function(user) {
          $scope.buttonAction({ user: user });
        });
      };

      $scope.$watch('searchStr', function() {
        $scope.usernameIsValid = false;
        if (!$scope.searchStr || !$scope.searchStr.length) { return; }
        $scope.usernameSearchResults = [];
        AdminUsers.searchUsernames({ username: $scope.searchStr }).$promise
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
    }
  };
}];
