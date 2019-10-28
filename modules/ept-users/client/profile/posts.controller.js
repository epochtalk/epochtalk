var ctrl = ['user', 'pageData', 'Posts', '$location', '$scope', '$rootScope', '$state', '$anchorScroll',
  function(user, pageData, Posts, $location, $scope, $rootScope, $state, $anchorScroll) {
    var ctrl = this;
    this.user = angular.copy(user);
    this.pageCount = Math.ceil(pageData.count / pageData.limit);
    this.queryParams = $location.search();
    this.page = pageData.page;
    this.limit = pageData.limit;
    this.desc = pageData.desc || true; // default to true
    this.usersPosts = pageData.posts;
    this.threads = pageData.threads;
    this.next = pageData.next;
    this.prev = pageData.prev;
    this.parent = $scope.$parent.ProfileCtrl;

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
      var descending;

      if (params.desc === false || params.desc === "false") { descending = false; }
      else { descending = true; }

      var pageChanged = false;
      var limitChanged = false;
      var descChanged = false;

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
      if ($state.current.name === 'users-posts' || $state.current.name === 'profile.posts') {
        if((pageChanged || limitChanged || descChanged && ctrl.threads)) { ctrl.pullPosts(true); }
        else if ((pageChanged || limitChanged || descChanged) && !ctrl,threads) { ctrl.pullPosts(); }
      }

    });
    $scope.$on('$destroy', function() { ctrl.offLCS(); });

    this.pullPosts = function(threads) {
      var params = {
        username: ctrl.user.username,
        page: ctrl.page,
        limit: ctrl.limit,
        desc: ctrl.desc
      };

      var promise = Posts.pageByUser(params).$promise
      .then(function(pageData) {
        ctrl.pageCount = Math.ceil(pageData.count / pageData.limit);
        ctrl.usersPosts = pageData.posts;
        ctrl.threads = false;
      });

      if (threads) {
        promise = Posts.pageStartedByUser(params).$promise
        .then(function(pageData) {
          ctrl.usersPosts = pageData.posts;
          ctrl.next = pageData.next;
          ctrl.prev = pageData.prev;
          ctrl.threads = true;
        });
      }
      return promise;
    };
  }
];

module.exports = angular.module('ept.profile.postsCtrl', [])
.controller('ProfilePostsCtrl', ctrl)
.name;
