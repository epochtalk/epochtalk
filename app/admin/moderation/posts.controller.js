module.exports = ['$scope', function($scope) {
  var ctrl = this;
  this.parent = $scope.$parent;
  this.parent.tab = 'posts';
  this.tableFilter = 0;
  this.selectedPost = null;

  this.selectPost = function(post) {
    ctrl.selectedPost = post;
  };

  // Placeholder reported post data
  this.reportedPosts = [{
    title: 'Morbi ut dapibus arcu, nec lobortis erat.',
    username: 'dorthy',
    reason: 'Spam post',
    reported_at: 1415401998756,
    posted_date: 1415401898756,
    moderator_notes: 'No action taken, invalid complaint'
  },
  {
    title: 'Fusce neque velit',
    username: 'Wizard119',
    reason: 'Post contains offensive content',
    reported_at: 1416185068298,
    posted_date: 1416175068298,
    moderator_notes: 'Post was modified to remove offensive content'
  },
  {
    title: 'Nullam fermentum mauris viverra',
    username: 'Frodo',
    reason: 'User double posted',
    reported_at: 1416190876753,
    posted_date: 1416170876753,
    moderator_notes: 'Double post was deleted'
  }];

}];
