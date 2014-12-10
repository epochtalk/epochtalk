module.exports = [function() {

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
