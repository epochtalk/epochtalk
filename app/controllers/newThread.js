module.exports = ['$routeParams', '$location', 'Auth', 'Threads',
  function($routeParams, $location, Auth, Threads) {
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
      this.thread.encodedBody = encoded;
      this.thread.body = text;
    };

    this.save = function(post) {
      // create a new thread and post
      this.thread.body = this.thread.encodedBody;
      Threads.save(this.thread).$promise
       .then(function(thread) {
        $location.path('/threads/' + thread.thread_id + '/posts');
      })
      .catch(function(err) {
        this.error.post = {};
        this.error.post.found = true;
        this.error.post.message = err.data.message;
      });
    };
  }
];
