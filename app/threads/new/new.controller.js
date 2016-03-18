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
    this.poll = {
      question: '',
      answers: ['', '']
    };

    this.controlAccess = Session.getControlAccess('threads', ctrl.thread.board_id);
    this.pollControlAccess =  { create: Session.hasPermission('polls.create') };
    this.loggedIn = Session.isAuthenticated;

    this.addPollAnswer = function() { ctrl.poll.answers.push(''); };
    this.removePollAnswer = function(index) { ctrl.poll.answers.splice(index, 1); };
    this.pollValid = function() {
      if (!ctrl.addPoll) { return true; }

      var valid = true;
      if (ctrl.poll.question.length === 0) { valid = false; }
      if (ctrl.poll.answers.length < 2) { valid = false; }
      if (ctrl.poll.answers.length > 9) { valid = false; }
      ctrl.poll.answers.map(function(answer) {
        if (answer.length === 0) { valid = false; }
      });

      return valid;
    };

    this.output = function() { console.log(ctrl.poll); };

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
