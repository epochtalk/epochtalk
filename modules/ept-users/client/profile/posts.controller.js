var ctrl = ['user', 'pageData', 'threadData', 'Posts', '$location', '$scope', '$rootScope', '$state', '$anchorScroll',
  function(user, pageData, threadData, Posts, $location, $scope, $rootScope, $state, $anchorScroll) {
    var ctrl = this;
    this.user = angular.copy(user);
    this.pageCount = Math.ceil(pageData.count / pageData.limit);
    this.queryParams = $location.search();
    this.page = pageData.page;
    this.limit = pageData.limit;
    this.desc = pageData.desc || true; // default to true
    this.usersPosts = pageData.posts;
    this.parent = $scope.$parent.ProfileCtrl;

    this.usersThreads = threadData.posts;
    this.tpage = threadData.page;
    this.tlimit = threadData.limit;
    this.next = threadData.next;
    this.prev = threadData.prev;
    this.tdesc = threadData.desc;

    if (this.parent) { this.parent.user = user; }

    if ($state.current.name === 'users-posts') { $anchorScroll(); }

    this.setDesc = function() {
      $location.search('page', 1);
      $location.search('desc', !ctrl.desc);
      // Update queryParams (forces pagination to refresh)
      ctrl.queryParams = $location.search();
    };

    this.setTDesc = function() {
      $location.search('tpage', 1);
      $location.search('tdesc', !ctrl.tdesc);
      // Update queryParams (forces pagination to refresh)
      ctrl.queryParams = $location.search();
    };

    this.getDesc = function() {
      var sortClass = 'fa fa-sort-desc';
      if (ctrl.desc === false) { sortClass = 'fa fa-sort-asc'; }
      return sortClass;
    };

    this.getTDesc = function() {
      var sortClass = 'fa fa-sort-desc';
      if (ctrl.tdesc === false) { sortClass = 'fa fa-sort-asc'; }
      return sortClass;
    };

    this.offLCS = $rootScope.$on('$locationChangeSuccess', function() {
      var params = $location.search();
      var page = Number(params.page) || 1;
      var limit = Number(params.limit) || 25;
      var tpage = Number(params.tpage) || 1;
      var tlimit = Number(params.tlimit) || 25;
      var descending;
      var tdescending;

      if (params.desc === false || params.desc === "false") { descending = false; }
      else { descending = true; }
      if (params.tdesc === false || params.tdesc === "false") { tdescending = false; }
      else { tdescending = true; }

      var pageChanged = false;
      var limitChanged = false;
      var descChanged = false;
      var tpageChanged = false;
      var tlimitChanged = false;
      var tdescChanged = false;

      if (page && page !== ctrl.page) {
        pageChanged = true;
        ctrl.page = page;
      }
      if (limit && limit !== ctrl.limit) {
        limitChanged = true;
        ctrl.limit = limit;
      }
      if (descending !== ctrl.desc) {
        descChanged = true;
        ctrl.desc = descending;
      }
      if (tpage && tpage !== ctrl.tpage) {
        tpageChanged = true;
        ctrl.tpage = tpage;
      }
      if (tlimit && tlimit !== ctrl.tlimit) {
        tlimitChanged = true;
        ctrl.tlimit = tlimit;
      }
      if (tdescending !== ctrl.tdesc) {
        tdescChanged = true;
        ctrl.tdesc = tdescending;
      }

      if ($state.current.name === 'users-posts' || $state.current.name === 'profile.posts') {
        if((pageChanged || limitChanged || descChanged) && (tpageChanged || tlimitChanged || tdescChanged)) {
          ctrl.pullThreads();
          ctrl.pullPosts();
        }
        else if (pageChanged || limitChanged || descChanged) { ctrl.pullPosts(); }
        else if (tpageChanged || tlimitChanged || tdescChanged) { ctrl.pullThreads(); }
      }

    });
    $scope.$on('$destroy', function() { ctrl.offLCS(); });

    this.pullPosts = function() {
      var params = {
        username: ctrl.user.username,
        page: ctrl.page,
        limit: ctrl.limit,
        desc: ctrl.desc
      };

      // replace current user post with new user posts
      Posts.pageByUser(params).$promise
      .then(function(pageData) {
        ctrl.pageCount = Math.ceil(pageData.count / pageData.limit);
        ctrl.usersPosts = pageData.posts;
      });
    };

    this.pullThreads = function() {
      var params = {
        username: ctrl.user.username,
        page: ctrl.tpage,
        limit: ctrl.tlimit,
        desc: ctrl.tdesc
      };

      // replace current user post with new user posts
      Posts.pageStartedByUser(params).$promise
      .then(function(threadData) {
        ctrl.usersThreads = threadData.posts;
        ctrl.next = threadData.next;
        ctrl.prev = threadData.prev;
      });
    };
  }
];

module.exports = angular.module('ept.profile.postsCtrl', [])
.controller('ProfilePostsCtrl', ctrl)
.name;
