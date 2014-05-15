module.exports = function($scope, Auth) {
  $scope.login = function(form) {
    console.log('user');
    console.log($scope.user);
    Auth.login('password', $scope.user);
  }
}
