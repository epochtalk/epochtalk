module.exports = function($scope, $routeParams, $http) {
  $scope.threadId = $routeParams.threadId;
  $http.get('/api/threads/' + $scope.threadId).success(function(thread) {
    console.log(thread);
  });
}
