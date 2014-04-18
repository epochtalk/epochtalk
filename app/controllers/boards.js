module.exports = function($scope, $http) {
  $http.get('/api/boards')
    .success(function(boards) {
      console.log(boards);
      $scope.boards = boards;
    });
};
