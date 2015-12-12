var controller = ['$anchorScroll', '$stateParams', '$location', 'Session', 'Threads', 'Alert', function($anchorScroll, $stateParams, $location, Session, Threads, Alert) {
    $anchorScroll();
    var ctrl = this;
    this.exitEditor = false;
    this.dirtyEditor = false;
    this.resetEditor = true;
    this.pollValid = false;
    this.poll = {};
    this.thread = {
      title: '',
      board_id: $stateParams.boardId,
      sticky: false,
      locked: false
    };

    this.controlAccess = Session.getControlAccess('threadControls', ctrl.thread.board_id);
    this.pollControlAccess =  { create: Session.hasPermission('pollControls.create') };
    this.loggedIn = Session.isAuthenticated;

    this.save = function() {
      ctrl.exitEditor = true;

      // append poll to thread
      if (ctrl.addPoll) { ctrl.thread.poll = ctrl.poll; }

      // create a new thread and post
      Threads.save(ctrl.thread).$promise
      .then(function(thread) { $location.path('/threads/' + thread.thread_id + '/posts'); })
      .catch(function(err) {
        ctrl.exitEditor = false;
        var error = 'Could not create thread: ' + err.data.message;
        if (err.status === 429) { error = 'New Thread Rate Limit Exceeded'; }
        Alert.error(error);
      });
    };
  }
];

module.exports = angular.module('ept.newThread.ctrl', [])
.controller('NewThreadCtrl', controller)
.name;
