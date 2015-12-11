var controller = ['$anchorScroll', '$stateParams', '$location', 'Session', 'Threads', 'Alert', function($anchorScroll, $stateParams, $location, Session, Threads, Alert) {
    $anchorScroll();
    var ctrl = this;
    this.exitEditor = false;
    this.dirtyEditor = false;
    this.resetEditor = true;
    this.thread = {
      title: '',
      board_id: $stateParams.boardId,
      sticky: false,
      locked: false
    };
    this.poll = {
      question: '',
      answers: ['', ''],
      max_answers: 1,
      change_vote: false,
      display_mode: 'always'
    };

    this.controlAccess = Session.getControlAccess('threadControls', ctrl.thread.board_id);
    this.pollControlAccess =  { create: Session.hasPermission('pollControls.create') };
    this.loggedIn = Session.isAuthenticated;

    this.addPollAnswer = function() { ctrl.poll.answers.push(''); };
    this.removePollAnswer = function(index) { ctrl.poll.answers.splice(index, 1); };
    this.pollValid = function() {
      if (!ctrl.addPoll) { return true; }

      var valid = true;
      if (ctrl.poll.question.length === 0) { valid = false; }
      if (ctrl.poll.answers.length < 2) { valid = false; }
      if (ctrl.poll.answers.length > 21) { valid = false; }
      ctrl.poll.answers.map(function(answer) { if (answer.length === 0) { valid = false; } });
      if (!ctrl.poll.max_answers || ctrl.poll.max_answers < 1) { valid = false; }
      if (ctrl.poll.max_answers > ctrl.poll.answers.length) { valid = false; }
      if (ctrl.poll.expiration_date && !ctrl.poll.expiration) { valid = false; }
      if (ctrl.poll.expiration_time && !ctrl.poll.expiration_date) { valid = false; }
      if (ctrl.poll.expiration && ctrl.poll.expiration < Date.now()) { valid = false; }
      if (ctrl.poll.display_mode !== 'always' && ctrl.poll.display_mode !== 'voted' && ctrl.poll.display_mode !== 'expired') { valid = false; }

      return valid;
    };

    this.calcExpiration = function() {
      var month, day, year, hour, minutes, tz, valid = false;
      if (ctrl.poll.expiration_date) {
        var date = new Date(ctrl.poll.expiration_date);
        valid = true;
        month = date.getMonth();
        day = date.getDate();
        year = date.getFullYear();
      }

      if (valid && ctrl.poll.expiration_time) {
        var time = new Date(ctrl.poll.expiration_time);
        hour = time.getHours();
        minutes = time.getMinutes();
        tz = time.getTimezoneOffset();
      }

      if (valid) {
        ctrl.poll.expiration = new Date(year, month, day, hour || 0, minutes || 0);
        if (ctrl.poll.expiration < Date.now()) { ctrl.poll.expiration = undefined; }
      }
      else { ctrl.poll.expiration = undefined; }

      if (!ctrl.poll.expiration && ctrl.poll.display_mode === 'expired') {
        ctrl.poll.display_mode = 'always';
      }
    };

    this.output = function() { console.log(ctrl.poll); };

    this.save = function() {
      ctrl.exitEditor = true;

      // append poll to thread
      if (ctrl.addPoll) { ctrl.thread.poll = ctrl.poll; }

      // create a new thread and post
      Threads.save(ctrl.thread).$promise
      .then(function(thread) {
        $location.path('/threads/' + thread.thread_id + '/posts');
      })
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
