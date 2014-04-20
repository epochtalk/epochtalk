module.exports = function($scope, $location, $routeParams, $http) {
  var rowsPerPage = 10;
  $http.get('/api/topics?boardId=' + $routeParams.boardId)
  .success(function(topics) {
    $scope.page = (topics.offset / rowsPerPage) + 1;
    $scope.topics = topics;
    angular.forEach($scope.topics.rows, function(topic) {
      var firstMessageId = topic.value.ID_FIRST_MSG;
      $http.get('/api/messages/' + firstMessageId)
      .success(function(message) {
        topic.message = message;
      });
    });
  });

  $scope.paginateNext = function() {
    $http.get('/api/topics?boardId=' + $routeParams.boardId + '&startkey_docid=' + $scope.topics.next_startkey_docid)
    .success(function(topics) {
      $scope.page = (topics.offset / rowsPerPage) + 1;
      console.log(topics.offset);
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

  $scope.paginatePrev = function() {
    $http.get('/api/topics?boardId=' + $routeParams.boardId + '&endkey_docid=' + $scope.topics.rows[0].id)
    .success(function(topics) {
      $scope.page = (topics.offset / rowsPerPage) + 1;
      console.log(topics.offset);
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
