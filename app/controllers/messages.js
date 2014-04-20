module.exports = function($scope, $routeParams, $http) {
  console.log('messages');
  $scope.rowsPerPage = 10;

  console.log('/api/messages?topicId=' + $routeParams.topicId); 
  $http.get('/api/messages?topicId=' + $routeParams.topicId)
  .success(function(messages) {
    $scope.page = (messages.offset / $scope.rowsPerPage) + 1;
    $scope.messages = messages;
  });

  $scope.paginateNext = function() {
    $http.get('/api/messages?topicId=' + $routeParams.topicId + '&startkey_docid=' + $scope.messages.next_startkey_docid)
    .success(function(messages) {
      $scope.page = (messages.offset / $scope.rowsPerPage) + 1;
      $scope.messages = messages;
    });
  };

  $scope.paginatePrev = function() {
    $http.get('/api/messages?topicId=' + $routeParams.topicId + '&endkey_docid=' + $scope.messages.rows[0].id)
    .success(function(messages) {
      $scope.page = (messages.offset / $scope.rowsPerPage) + 1;
      $scope.messages = messages;
    });
  };

}
