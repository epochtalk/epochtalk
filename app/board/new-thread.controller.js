module.exports = ['$stateParams', '$location', 'Auth', 'Threads',
  function($stateParams, $location, Auth, Threads) {
    var ctrl = this;

    this.exitEditor = false;
    this.dirtyEditor = false;
    this.resetEditor = true;
    this.error = {};
    this.thread = {
      board_id: $stateParams.boardId,
      raw_body: '',
      body: '',
      title: ''
    };

    this.loggedIn = Auth.isAuthenticated;
    Auth.checkAuthentication();

    this.save = function(post) {
      ctrl.exitEditor = true;
      // create a new thread and post
      Threads.save(ctrl.thread).$promise
       .then(function(thread) {
        $location.path('/threads/' + thread.thread_id + '/posts');
      })
      .catch(function(err) {
        ctrl.exitEditor = false;
        ctrl.error.post = {};
        ctrl.error.post.found = true;
        ctrl.error.post.message = err.data.message;
      });
    };
  }
];
