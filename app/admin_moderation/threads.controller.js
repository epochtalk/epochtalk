module.exports = ['$scope', function($scope) {
  this.parent = $scope.$parent;
  this.parent.tab = 'threads';
  this.fullWidth = this.parent.ModerationCtrl.fullWidth; // full width in admin view/fixed width in moderator view

  this.toggles = {
    pending: false,
    history: false
  };

  // Placeholder reported thread data
  this.reportedThreads = [{
    thread: 'Purus in turpis porta lorem ipsum',
    reason: 'Spam Thread',
    reported_at: 1415401998756,
    moderator_notes: 'No action taken, invalid complaint'
  },
  {
    thread: 'Suspendisse semper ante consequat tincidunt consequat',
    reason: 'Thread doesn\'t follow the forum rules',
    reported_at: 1416185068298,
    moderator_notes: 'Thread was modified to remove disallowed content'
  },
  {
    thread: 'Donec efficitur purus in turpis',
    reason: 'User failed to use search before posting duplicate topic.',
    reported_at: 1416190876753,
    moderator_notes: 'User was given a warning.'
  }];

}];
