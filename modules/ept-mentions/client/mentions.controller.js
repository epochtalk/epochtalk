var ctrl = ['$anchorScroll', '$scope', '$rootScope', '$location', '$timeout', 'Session', 'pageData', 'Mentions', 'NotificationSvc', 'Websocket',
  function($anchorScroll, $scope, $rootScope, $location, $timeout, Session, pageData, Mentions, NotificationSvc, Websocket) {

    // page variables
    var ctrl = this;
    this.loggedIn = Session.isAuthenticated;
    this.dismiss = NotificationSvc.dismiss;
    this.delete = NotificationSvc.deleteMention;

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

    // Websocket Handling
    function userChannelHandler(data) {
      if (data.action === 'refreshMentions') {
        ctrl.pullPage();
      }
    }

    Websocket.watchUserChannel(userChannelHandler);
    $scope.$on('$destroy', function() { Websocket.unwatchUserChannel(userChannelHandler); });

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
      })
      .catch(function(err) {
        console.log(err);
      });
    };

  }
];

module.exports = angular.module('ept.mentions.ctrl', [])
.controller('MentionsCtrl', ctrl)
.name;
