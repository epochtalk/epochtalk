module.exports = ['Session', 'Alert', 'Threads', '$timeout', function(Session, Alert, Threads, $timeout) {
  return {
    restrict: 'E',
    scope: { poll: '=', valid: '=' },
    template: require('./poll_creator.html'),
    link: function($scope, $element, $attr) {
      $scope.user = Session.user;
      $scope.poll.question = $scope.poll.question || '';
      $scope.poll.answers = $scope.poll.answers || ['', ''];
      $scope.poll.max_answers = $scope.poll.max_answers || 1;
      $scope.poll.change_vote = $scope.poll.change_vote || false;
      $scope.poll.display_mode = $scope.poll.display_mode || 'always';

      $scope.addPollAnswer = function() { $scope.poll.answers.push(''); };
      $scope.removePollAnswer = function(index) { $scope.poll.answers.splice(index, 1); };

      $scope.$watch('poll', function() {
        var valid = true;
        if ($scope.poll.question.length === 0) { valid = false; }
        if ($scope.poll.answers.length < 2) { valid = false; }
        if ($scope.poll.answers.length > 21) { valid = false; }
        $scope.poll.answers.map(function(a) { if (a.length === 0) { valid = false; } });
        if (!$scope.poll.max_answers || $scope.poll.max_answers < 1) { valid = false; }
        if ($scope.poll.max_answers > $scope.poll.answers.length) { valid = false; }
        if ($scope.poll.expiration_date && !$scope.poll.expiration) { valid = false; }
        if ($scope.poll.expiration_time && !$scope.poll.expiration_date) { valid = false; }
        if ($scope.poll.expiration && $scope.poll.expiration < Date.now()) { valid = false; }
        if ($scope.poll.display_mode !== 'always' && $scope.poll.display_mode !== 'voted' && $scope.poll.display_mode !== 'expired') { valid = false; }
        $scope.valid = valid;
      }, true);

      $scope.calcExpiration = function() {
        var month, day, year, hour, minutes, valid = false;
        if ($scope.poll.expiration_date) {
          var date = new Date($scope.poll.expiration_date);
          valid = true;
          month = date.getMonth();
          day = date.getDate();
          year = date.getFullYear();
        }

        if (valid && $scope.poll.expiration_time) {
          var time = new Date($scope.poll.expiration_time);
          hour = time.getHours();
          minutes = time.getMinutes();
        }

        if (valid) {
          $scope.poll.expiration = new Date(year, month, day, hour || 0, minutes || 0);
          if ($scope.poll.expiration < Date.now()) { $scope.poll.expiration = undefined; }
        }
        else { $scope.poll.expiration = undefined; }

        if (!$scope.poll.expiration && $scope.poll.display_mode === 'expired') {
          $scope.poll.display_mode = 'always';
        }
      };

    }
  };
}];
