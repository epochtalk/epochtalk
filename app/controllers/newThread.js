module.exports = ['$routeParams', '$location', 'Auth', 'Threads',
  function($routeParams, $location, Auth, Threads) {
    var ctrl = this;
    this.loggedIn = Auth.isAuthenticated;
    this.error = {};

    Auth.checkAuthentication();

    this.thread = {
      board_id: $routeParams.boardId,
      encodedBody: '',
      body: '',
      title: ''
    };

    this.updateText = function(encoded, text) {
      ctrl.thread.encodedBody = encoded;
      ctrl.thread.body = text;
    };

    this.save = function(post) {
      // create a new thread and post
      ctrl.thread.body = ctrl.thread.encodedBody;
      Threads.save(ctrl.thread).$promise
       .then(function(thread) {
        $location.path('/threads/' + thread.thread_id + '/posts');
      })
      .catch(function(err) {
        ctrl.error.post = {};
        ctrl.error.post.found = true;
        ctrl.error.post.message = err.data.message;
      });
    };
  }
];
