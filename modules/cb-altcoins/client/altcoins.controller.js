module.exports = ['$timeout', '$anchorScroll', 'Session', 'projects',
  function($timeout, $anchorScroll, Session, projects) {
    $timeout($anchorScroll);

    this.loggedIn = Session.isAuthenticated;
    this.projects = projects || [];
  }
];
