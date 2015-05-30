module.exports = ['$stateParams', '$location', 'Session', 'Threads', 'Alert',
  function($stateParams, $location, Session, Threads, Alert) {
    var ctrl = this;

    this.exitEditor = false;
    this.dirtyEditor = false;
    this.resetEditor = true;
    this.thread = {
      board_id: $stateParams.boardId,
      raw_body: '',
      body: '',
      title: '',
      sticky: false,
      locked: false
    };

    this.loggedIn = Session.isAuthenticated;
    this.user = Session.user;

    this.save = function(post) {
      ctrl.exitEditor = true;
      // create a new thread and post
      Threads.save(ctrl.thread).$promise
      .then(function(thread) {
        $location.path('/threads/' + thread.thread_id + '/posts');
      })
      .catch(function(err) {
        ctrl.exitEditor = false;
        Alert.error('Could not create thread: ' + err.data.message);
      });
    };
  }
];
