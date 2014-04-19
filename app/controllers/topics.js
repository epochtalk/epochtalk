module.exports = function($scope, $location, $routeParams, $http) {
  $http.get('/api/topics?boardId=' + $routeParams.boardId)
  .success(function(topics) {
    $scope.topics = topics;
    angular.forEach($scope.topics.rows, function(topic) {
      var firstMessageId = topic.value.ID_FIRST_MSG;
      $http.get('/api/messages/' + firstMessageId)
      .success(function(message) {
        topic.message = message;
      });
    });
  });

  $scope.paginate = function() {
    $http.get('/api/topics?boardId=' + $routeParams.boardId + '&startkey=' + $scope.topics.next_startkey_docid)
    .success(function(topics) {
      $scope.topics = topics;
      angular.forEach($scope.topics.rows, function(topic) {
        var firstMessageId = topic.value.ID_FIRST_MSG;
        $http.get('/api/messages/' + firstMessageId)
        .success(function(message) {
          topic.message = message;
        });
      });
    });

  };
};
