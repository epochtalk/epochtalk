module.exports = function($scope, $http) {
  $http.get('/api/boards').success(function(boards) {
    $scope.boards = boards;
  });
};
