module.exports = function($scope, Auth) {
  $scope.register = function(form) {
    Auth.register('password', $scope.user);
  }
}
