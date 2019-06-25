var directive = ['Messages', function(Messages) {
  return {
    restrict: 'E',
    template: require('./autocomplete-user-id.html'),
    scope: {
      userId: '=',
      username: '=',
      inputPlaceholder: '@',
    },
    controller: ['$scope', function($scope) {
      $scope.searchResults = [];
      $scope.usernameIsValid = false;

      $scope.$watch('username', function() {
        $scope.userId = '';
        $scope.usernameIsValid = false;
        if (!$scope.username || !$scope.username.length) { return; }
        $scope.searchResults = [];
        Messages.findUser({ username: $scope.username }).$promise
        .then(function(results) {
          $scope.searchResults = results;
          // ignore casing
          for (var i = 0; i < results.length; i++) {
            var lowerCasedUsername = results[i].username.toLowerCase();
            if (lowerCasedUsername === $scope.username.toLowerCase()) {
              $scope.userId = results[i].id;
              $scope.usernameIsValid = true;
              break;
            }
          }
        });
      });
    }]
  };
}];

angular.module('ept').directive('autocompleteUserId', directive);
