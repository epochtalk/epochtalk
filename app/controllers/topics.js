module.exports = function($scope, $location, $routeParams, $http) {
  $http.get('/api/topics?boardId=' + $routeParams.boardId)
  .success(function(topics) {
    $scope.topics = topics;
    console.log(topics);
  });
};
