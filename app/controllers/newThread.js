module.exports = ['$scope', '$routeParams', '$http','$rootScope', '$location', 'Auth', 'breadcrumbs',
  function($scope, $routeParams, $http, $rootScope, $location, Auth, breadcrumbs) {
    $rootScope.breadcrumbs = breadcrumbs.get();
    $scope.loggedIn = Auth.isAuthenticated;
    $scope.error = {};
    
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
      $http.post('/api/threads', $scope.thread)
      .then(function(response) {
        $location.path('/threads/' + response.data.thread_id + '/posts');
      })
      .catch(function(err) {
        $scope.error.post = {};
        $scope.error.post.found = true;
        $scope.error.post.message = err.data.message;
      });
    };
  }
];
