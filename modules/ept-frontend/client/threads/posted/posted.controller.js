var ctrl = ['$rootScope', '$scope', '$anchorScroll', '$location', '$timeout', 'Session', 'Threads',  'pageData',
  function($rootScope, $scope, $anchorScroll, $location, $timeout, Session, Threads, pageData) {
    var ctrl = this;
    this.loggedIn = Session.isAuthenticated; // check Auth
    this.page = pageData.page; // this page
    this.limit = pageData.limit;
    this.threads = pageData.threads;

    this.parent = $scope.$parent.PostedWrapperCtrl;
    this.parent.loggedIn = Session.isAuthenticated;
    this.parent.page = pageData.page;
    this.parent.pageCount = Math.ceil(pageData.count / this.limit);

    // generate page listing for each thread
    this.getPageKeysForThread = function(thread) {
      var pageKeys = [];
      if (thread.page_count < 7) {
        var i = 1;
        while(pageKeys.push({ val: i++, threadId: thread.id}) < thread.page_count) {}
      }
      else {
        var thirdToLastPage = (thread.page_count - 2);
        var secondToLastPage = (thread.page_count - 1);
        var lastPage = thread.page_count;
        pageKeys.push({ val: 1, threadId: thread.id });
        pageKeys.push({ val: 2, threadId: thread.id });
        pageKeys.push({ val: 3, threadId: thread.id });
        pageKeys.push({ val: '&hellip;', threadId: null });
        pageKeys.push({ val: thirdToLastPage, threadId: thread.id });
        pageKeys.push({ val: secondToLastPage, threadId: thread.id });
        pageKeys.push({ val: lastPage, threadId: thread.id });
      }
      thread.page_keys = pageKeys;
    };

    // page count for each thread
    function threadPageCount(thread) {
      // user based UI
      thread.page_count = Math.ceil(thread.post_count / ctrl.limit);
      ctrl.getPageKeysForThread(thread);
    }
    this.threads.forEach(threadPageCount);

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
        ctrl.parent.page = page;
        ctrl.page = page;
      }
      if (limit && limit !== ctrl.limit) {
        limitChanged = true;
        ctrl.limit = limit;
      }

      if(pageChanged || limitChanged) { ctrl.pullPage(); }
    });
    $scope.$on('$destroy', function() { ctrl.offLCS(); });

    this.pullPage = function() {
      var query = { page: ctrl.page, limit: ctrl.limit };

      // replace current threads with new threads
      Threads.posted(query).$promise
      .then(function(pageData) {
        ctrl.parent.pageCount = Math.ceil(pageData.count / pageData.limit);
        ctrl.threads = pageData.threads;
        ctrl.threads.forEach(threadPageCount);
        $timeout($anchorScroll);
      });
    };
  }
];

module.exports = angular.module('ept.posted.ctrl', [])
.controller('PostedCtrl', ctrl)
.name;
