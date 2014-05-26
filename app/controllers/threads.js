module.exports = function($scope, $routeParams) {
  console.log('threads');
  $scope.parentPostId = $routeParams.parentPostId;
};
