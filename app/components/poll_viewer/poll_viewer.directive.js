module.exports = ['Session', 'Alert', 'Threads', '$timeout', function(Session, Alert, Threads, $timeout) {
  return {
    restrict: 'E',
    scope: { thread: '=' },
    template: require('./poll_viewer.html'),
    link: function($scope, $element, $attr) {
      // poll selected answers
      $scope.pollAnswers = [];
      $scope.user = Session.user;
      $scope.switches = { editPoll: false };
      // $scope.poll and $scope.options set in watch

      // Initialization
      $scope.$watch('thread', function() {
        $scope.poll = $scope.thread.poll;
        if (!$scope.poll) { return; }
        $scope.options = {
          expiration: $scope.poll.expiration || undefined,
          change_vote: $scope.poll.change_vote,
          max_answers: $scope.poll.max_answers,
          display_mode: $scope.poll.display_mode
        };

        // get poll permissions
        $scope.permissions = Session.getControlAccess('pollControls', $scope.thread.board_id);
        if ($scope.user.id === $scope.thread.user.id) {
          $scope.permissions.privilegedLock = $scope.permissions.lock;
        }

        // poll expiration
        if ($scope.poll.expiration) {
          var expiry = new Date($scope.poll.expiration);
          $scope.poll.expired = expiry < Date.now();
        }

        // calculate poll votes
        $scope.calculatePollPercentage();
      });

      $scope.toggleAnswer = function(answerId) {
        var maxAnswers = $scope.poll.max_answers;
        var idx = $scope.pollAnswers.indexOf(answerId);
        if (idx > -1) { $scope.pollAnswers.splice(idx, 1); }
        else if ($scope.pollAnswers.length < maxAnswers) { $scope.pollAnswers.push(answerId); }
      };

      $scope.showPollResults = function() {
        var show = false;
        var displayMode = $scope.poll.display_mode;
        var hasVoted = $scope.poll.hasVoted;
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

        Threads.vote({ threadId: threadId, pollId: pollId, answerIds: answerIds}).$promise
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

        Threads.removeVote({ threadId: threadId, pollId: pollId }).$promise
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
            threadId: $scope.thread.id,
            pollId: $scope.poll.id,
            lockValue: $scope.poll.locked
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

      $scope.canVote = function() {
        var result = false;
        var poll = $scope.poll;
        if (!poll.hasVoted && !poll.locked && !poll.expired && $scope.permissions.vote) { result = true; }
        return result;
      };

      $scope.canRemoveVote = function() {
        var result = false;
        var poll = $scope.poll;
        if (poll.hasVoted && !poll.locked && !poll.expired && $scope.permissions.vote && poll.change_vote) { result = true; }
        return result;
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
        var changes = { threadId: $scope.thread.id, pollId: $scope.poll.id };
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
          Alert.success('Poll Options Changes Saved');
        })
        .catch(function(err) { Alert.error('Error: ' + err); });
      };
    }
  };
}];
