module.exports = ['$scope', function($scope) {
  this.parent = $scope.$parent;
  this.parent.tab = 'posts';

  // Placeholder reported post data
  this.reportedPosts = [{
    post: 'Morbi ut dapibus arcu, nec lobortis erat.',
    reason: 'Spam post',
    reported_at: 1415401998756,
    moderator_notes: 'No action taken, invalid complaint'
  },
  {
    post: 'Fusce neque velit',
    reason: 'Post contains offensive content',
    reported_at: 1416185068298,
    moderator_notes: 'Post was modified to remove offensive content'
  },
  {
    post: 'Nullam fermentum mauris viverra',
    reason: 'User double posted',
    reported_at: 1416190876753,
    moderator_notes: 'Double post was deleted'
  }];

}];
