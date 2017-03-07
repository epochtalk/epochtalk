var ctrl = ['$anchorScroll', '$timeout', 'Session', 'NotificationSvc', 'Mentions',
  function($anchorScroll, $timeout, Session, NotificationSvc, Mentions) {

    // page variables
    var ctrl = this;
    this.loggedIn = Session.isAuthenticated;

    // index variables
    // this.page = pageData.page;
    // this.limit = pageData.limit;
    this.mentions = JSON.stringify(NotificationSvc.getMentionsList(), null, 2);

    // Scroll fix for nested state
    $timeout($anchorScroll);
    // generate page listing for each thread

    this.pullPage = function(pageIncrement) {
      ctrl.page = ctrl.page + pageIncrement;
      ctrl.page = ctrl.page > 1 ? ctrl.page : undefined;
      var query = { page: ctrl.page, limit: ctrl.limit };

      // replace current mentions with new mentions
      Mentions.latest(query).$promise
      .then(function(pageData) {
        ctrl.mentions = pageData.mentions;
        $timeout($anchorScroll);
      });
    };

  }
];

module.exports = angular.module('ept.mentions.ctrl', [])
.controller('MentionsCtrl', ctrl)
.name;
