module.exports = ['$timeout', '$anchorScroll', 'Session', 'altcoins',
  function($timeout, $anchorScroll, Session, altcoins) {
    $timeout($anchorScroll);

    this.loggedIn = Session.isAuthenticated;
    this.altcoins = altcoins || [];
  }
];
