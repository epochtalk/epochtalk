var ctrl = ['$anchorScroll', '$scope', '$rootScope', '$location', '$timeout', 'Session', 'pageData', 'Mentions', 'NotificationSvc',
  function($anchorScroll, $scope, $rootScope, $location, $timeout, Session, pageData, Mentions, NotificationSvc) {

    // page variables
    var ctrl = this;
    this.loggedIn = Session.isAuthenticated;
    this.dismiss = NotificationSvc.dismiss;
    this.delete = NotificationSvc.deleteMention;

    this.markRead = function(opts) {
      ctrl.dismiss(opts)
      .then(function() {
        for (var i = 0; i < ctrl.mentions.length; i++) {
          var mention = ctrl.mentions[i];
          if (mention.notification_id === opts.id) {
            mention.viewed = true;
            break;
          }
        }
      });
    };

    // index variables
    this.page = pageData.page;
    this.next = pageData.next;
    this.prev = pageData.prev;
    this.limit = pageData.limit;
    this.mentions = pageData.data;

    // Scroll fix for nested state
    $timeout($anchorScroll);

    this.offLCS = $rootScope.$on('$locationChangeSuccess', function() {
      var params = $location.search();
      var page = Number(params.page) || 1;
      var limit = Number(params.limit) || 25;
      var pageChanged = false;
      var limitChanged = false;


      if (page && page !== ctrl.page) {
        pageChanged = true;
        ctrl.page = page;
      }
      if (limit && limit !== ctrl.limit) {
        limitChanged = true;
        ctrl.limit = limit;
      }
      if(pageChanged || limitChanged) { ctrl.pullPage(); }
    });
    $scope.$on('$destroy', function() { ctrl.offLCS(); });

    this.initialLoad = true;
    $scope.$watch(function() { return NotificationSvc.getRefreshPage(); }, function(refresh) {
      if (refresh) {
        ctrl.pullPage();
        NotificationSvc.setRefreshPage(false);
      }
    });

    this.pullPage = function() {
      ctrl.page = ctrl.page;
      var query = { page: ctrl.page, limit: ctrl.limit, extended: true };

      // replace current mentions with new mentions
      Mentions.page(query).$promise
      .then(function(pageData) {
        ctrl.mentions = pageData.data;
        ctrl.next = pageData.next;
        ctrl.prev = pageData.prev;
        ctrl.limit = pageData.limit;
        $timeout($anchorScroll);
      });
    };

  }
];

module.exports = angular.module('ept.mentions.ctrl', [])
.controller('MentionsCtrl', ctrl)
.name;
