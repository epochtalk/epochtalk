var directive = ['User', function(User) {
  return {
    restrict: 'E',
    template: require('./autocomplete-user-id.html'),
    scope: {
      userId: '=',
      username: '=',
      inputPlaceholder: '@',
      admin: '='
    },
    controller: ['$scope', function($scope) {
      $scope.searchResults = [];
      $scope.usernameIsValid = false;

      $scope.$watch('username', function() {
        $scope.userId = '';
        $scope.usernameIsValid = false;
        if (!$scope.username || !$scope.username.length) { return; }
        $scope.searchResults = [];
        User.lookup({ username: $scope.username, self: $scope.admin }).$promise
        .then(function(results) {
          $scope.searchResults = results;
          // ignore casing
          for (var i = 0; i < results.length; i++) {
            if (results[i].username && results[i].username.toLowerCase() === $scope.username.toLowerCase()) {
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
