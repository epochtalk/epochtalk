module.exports = ['$scope', function($scope) {
  this.parent = $scope.$parent;
  this.parent.tab = 'users';

  // Placeholder reported user data
  this.reportedUsers = [{
    username: 'daisy_wisozk',
    reason: 'Phasellus non justo sit amet libero tincidunt maximus. Morbi ut dapibus arcu, nec lobortis erat. Fusce ultricies feugiat nulla, at dignissim magna porta et. Pellentesque ultricies quam a magna laoreet blandit. Aenean maximus pellentesque dignissim. In molestie sapien ac sagittis vehicula. In vitae fermentum dui. Integer sed interdum neque.',
    reported_at: 1415401998756,
    moderator_notes: 'No action taken, invalid complaint'
  },
  {
    username: 'orie',
    reason: 'Fusce neque velit, tincidunt nec aliquet ac, laoreet vitae ligula. Nullam vulputate gravida odio, at varius ipsum volutpat vel. Aenean eget justo eget orci vulputate molestie. Fusce et congue elit, id ullamcorper ante. Curabitur varius dictum enim, et suscipit dui sodales nec.',
    reported_at: 1416185068298,
    moderator_notes: 'User was banned'
  },
  {
    username: 'ida_franecki',
    reason: 'Donec efficitur purus in turpis porta dignissim. Nullam fermentum mauris viverra, maximus nisl non, euismod ipsum. Suspendisse semper ante consequat tincidunt consequat.',
    reported_at: 1416190876753,
    moderator_notes: 'User was warned'
  }];

}];
