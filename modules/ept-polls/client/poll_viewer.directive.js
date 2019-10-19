var directive = ['Session', 'BanSvc', 'Alert', 'Threads', '$timeout', function(Session, BanSvc, Alert, Threads, $timeout) {
  return {
    restrict: 'E',
    scope: { thread: '=', reset: '=' },
    template: require('./poll_viewer.html'),
    link: function($scope) {
      // poll selected answers
      $scope.pollAnswers = [];
      $scope.user = Session.user;
      $scope.banned = BanSvc.banStatus();
      $scope.switches = { editPoll: false };
      // $scope.poll and $scope.options set in watch

      // Poll Permissions
      $scope.canVote = function() {
        var vote = true;
        var poll = $scope.poll;
        if (!Session.isAuthenticated()) { vote = false; }
        if ($scope.banned) { vote = false; }
        if (!Session.hasPermission('threads.vote.allow')) { vote = false; }
        if (poll.has_voted) { vote = false; }
        if (poll.locked) { vote = false; }
        if (poll.expired) { vote = false; }
        return vote;
      };

      $scope.canRemoveVote = function() {
        var vote = true;
        var poll = $scope.poll;
        if (!Session.isAuthenticated()) { vote = false; }
        if ($scope.banned) { vote = false; }
        if (!Session.hasPermission('threads.removeVote.allow')) { vote = false; }
        if (!poll.has_voted) { vote = false; }
        if (poll.locked) { vote = false; }
        if (poll.expired) { vote = false; }
        if (!poll.change_vote) { vote = false; }
        return vote;
      };

      $scope.canEdit = function() {
        if (!Session.isAuthenticated()) { return false; }
        if ($scope.banned) { return false; }
        if (!Session.hasPermission('threads.editPoll.allow')) { return false; }

        var edit = false;
        if ($scope.thread.user.id === Session.user.id) { edit = true; }
        else {
          if (Session.hasPermission('threads.editPoll.bypass.owner.admin')) { edit = true; }
          else if (Session.hasPermission('threads.editPoll.bypass.owner.priority')) { edit = true; }
          else if (Session.hasPermission('threads.editPoll.bypass.owner.mod')) {
            if (Session.moderatesBoard($scope.thread.board_id)) { edit = true; }
          }
        }
        return edit;
      };

      $scope.canLock = function() {
        if (!Session.isAuthenticated()) { return false; }
        if ($scope.banned) { return false; }
        if (!Session.hasPermission('threads.lockPoll.allow')) { return false; }

        var lock = false;
        if ($scope.thread.user.id === Session.user.id) { lock = true; }
        else {
          if (Session.hasPermission('threads.lockPoll.bypass.owner.admin')) { lock = true; }
          else if (Session.hasPermission('threads.lockPoll.bypass.owner.priority')) { lock = true; }
          else if (Session.hasPermission('threads.lockPoll.bypass.owner.mod')) {
            if (Session.moderatesBoard($scope.thread.board_id)) { lock = true; }
          }
        }
        return lock;
      };

      // Initialization
      $scope.$watch('thread', function() { initialize(); });

      $scope.$watch('reset', function(newValue) {
        if (newValue === true) { initialize(); }
      });

      function initialize() {
        $scope.poll = $scope.thread.poll;
        if (!$scope.poll) { return; }
        $scope.options = {
          expiration: $scope.poll.expiration || undefined,
          change_vote: $scope.poll.change_vote,
          max_answers: $scope.poll.max_answers,
          display_mode: $scope.poll.display_mode
        };

        // poll expiration
        if ($scope.poll.expiration) {
          // set poll expired
          var expiry = new Date($scope.poll.expiration);
          $scope.poll.expired = expiry < Date.now();

          // set options expiration
          var datetime = new Date($scope.poll.expiration);
          $scope.options.expiration_date = datetime;
          $scope.options.expiration_time = datetime;
        }

        // calculate poll votes
        $scope.calculatePollPercentage();
        $scope.reset = false;
      }

      $scope.toggleAnswer = function(answerId) {
        var maxAnswers = $scope.poll.max_answers;
        var idx = $scope.pollAnswers.indexOf(answerId);
        if (idx > -1) { $scope.pollAnswers.splice(idx, 1); }
        else if ($scope.pollAnswers.length < maxAnswers) { $scope.pollAnswers.push(answerId); }
      };

      $scope.showPollResults = function() {
        var show = false;
        var displayMode = $scope.poll.display_mode;
        var hasVoted = $scope.poll.has_voted;
        var expired = $scope.poll.expired;
        if (displayMode === 'always') { show = true; }
        else if (displayMode === 'voted' && hasVoted) { show = true; }
        else if (displayMode === 'expired' && expired) { show = true; }
        return show;
      };

      $scope.vote = function() {
        var threadId = $scope.thread.id;
        var pollId = $scope.poll.id;
        var answerIds = $scope.pollAnswers;

        Threads.vote({ thread_id: threadId, poll_id: pollId, answer_ids: answerIds}).$promise
        .then(function(data) {
          $scope.pollAnswers = [];
          $scope.poll = data;
          $scope.calculatePollPercentage();
          Alert.success('Voted in poll');
        })
        .catch(function() { Alert.error('Vote could not be processed'); });
      };

      $scope.removeVote = function() {
        var threadId = $scope.thread.id;
        var pollId = $scope.poll.id;

        Threads.removeVote({ thread_id: threadId, poll_id: pollId }).$promise
        .then(function(data) {
          $scope.pollAnswers = [];
          $scope.poll = data;
          $scope.calculatePollPercentage();
          Alert.success('Removed Vote from Poll');
        })
        .catch(function(err) { Alert.error('Error: ' + err.data.message); });
      };

      $scope.updateLockPoll = function() {
        $timeout(function() {
          var input = {
            thread_id: $scope.thread.id,
            poll_id: $scope.poll.id,
            locked: $scope.poll.locked
          };
          return Threads.lockPoll(input).$promise
          .catch(function() {
            $scope.poll.locked = !$scope.poll.locked;
            Alert.error('Error Locking Poll');
          });
        });
      };

      $scope.calculatePollPercentage = function() {
        if (!$scope.poll) { return; }

        $scope.poll.totalVotes = 0;
        $scope.poll.answers.forEach(function(answer) { $scope.poll.totalVotes += answer.votes; });
        $scope.poll.answers.map(function(answer) {
          var percentage = (answer.votes/$scope.poll.totalVotes) * 100 || 0;
          percentage = +percentage.toFixed(1);
          answer.style = { width: percentage + '%' };
          answer.percentage = percentage;
        });
      };

      $scope.pollValid = function() {
        var valid = true;
        if (!$scope.options.max_answers || $scope.options.max_answers < 1) { valid = false; }
        if ($scope.options.max_answers > $scope.poll.answers.length) { valid = false; }
        if ($scope.options.expiration_date && !$scope.options.expiration) { valid = false; }
        if ($scope.options.expiration_time && !$scope.options.expiration_date) { valid = false; }
        if ($scope.options.expiration && $scope.options.expiration < Date.now()) { valid = false; }
        if ($scope.options.display_mode !== 'always' && $scope.options.display_mode !== 'voted' && $scope.options.display_mode !== 'expired') { valid = false; }
        return valid;
      };

      $scope.calcExpiration = function() {
        var month, day, year, hour, minutes, valid = false;
        if ($scope.options.expiration_date) {
          var date = new Date($scope.options.expiration_date);
          valid = true;
          month = date.getMonth();
          day = date.getDate();
          year = date.getFullYear();
        }

        if (valid && $scope.options.expiration_time) {
          var time = new Date($scope.options.expiration_time);
          hour = time.getHours();
          minutes = time.getMinutes();
        }

        if (valid) {
          $scope.options.expiration = new Date(year, month, day, hour || 0, minutes || 0);
          if ($scope.options.expiration < Date.now()) { $scope.options.expiration = undefined; }
        }
        else { $scope.options.expiration = undefined; }

        if (!$scope.options.expiration && $scope.options.display_mode === 'expired') {
          $scope.options.display_mode = 'always';
        }
      };

      $scope.saveOptions = function() {
        var changes = { thread_id: $scope.thread.id, poll_id: $scope.poll.id };
        Threads.editPoll(changes, $scope.options).$promise
        .then(function(data) {
          $scope.poll.max_answers = data.max_answers;
          $scope.poll.change_vote = data.change_vote;
          $scope.poll.expiration = data.expiration || undefined;
          $scope.poll.display_mode = data.display_mode;
          // poll expiration
          if ($scope.poll.expiration) {
            var expiry = new Date($scope.poll.expiration);
            $scope.poll.expired = expiry < Date.now();
          }
          $scope.switches.editPoll = false;
          $scope.pollAnswers.length = 0;
          Alert.success('Poll Options Changes Saved');
        })
        .catch(function() { Alert.error('There was an error updating the poll'); });
      };
    }
  };
}];

module.exports = angular.module('ept.directives.poll-viewer', [])
.directive('pollViewer', directive);
