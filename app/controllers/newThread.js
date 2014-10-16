module.exports = ['$scope', '$routeParams', '$rootScope', '$location', 'Auth', 'Threads',
  function($scope, $routeParams, $rootScope, $location, Auth, Threads) {
    $scope.loggedIn = Auth.isAuthenticated;
    $scope.error = {};

    Auth.checkAuthentication();

    $scope.thread = {
      board_id: $routeParams.boardId,
      encodedBody: '',
      body: '',
      title: ''
    };

    $scope.updateText = function(encoded, text) {
      $scope.thread.encodedBody = encoded;
      $scope.thread.body = text;
    };

    $scope.save = function(post) {
      // create a new thread and post
      $scope.thread.body = $scope.thread.encodedBody;
      Threads.save($scope.thread).$promise
       .then(function(thread) {
        $location.path('/threads/' + thread.thread_id + '/posts');
      })
      .catch(function(err) {
        $scope.error.post = {};
        $scope.error.post.found = true;
        $scope.error.post.message = err.data.message;
      });
    };
  }
];
