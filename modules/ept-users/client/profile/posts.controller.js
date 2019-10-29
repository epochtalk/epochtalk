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
    this.threads = pageData.threads ? true : false;
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

    this.getDesc = function() {
      var sortClass = 'fa fa-sort-desc';
      if (ctrl.desc === false) { sortClass = 'fa fa-sort-asc'; }
      return sortClass;
    };

    this.offLCS = $rootScope.$on('$locationChangeSuccess', function(reload) {
      var params = $location.search();
      var page = Number(params.page) || 1;
      var limit = Number(params.limit) || 25;
      var descending;
      var threads;

      if (params.desc === false || params.desc === "false") { descending = false; }
      else { descending = true; }

      if (params.threads === true || params.threads === "true") { threads = true; }
      else { threads = false; }

      var pageChanged = false;
      var limitChanged = false;
      var descChanged = false;
      var threadsChanged = false;

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
      if (threads !== ctrl.threads) {
        threadsChanged = true;
        ctrl.threads = threads;
      }
      if ($state.current.name === 'users-posts' || $state.current.name === 'profile.posts') {
        if(pageChanged || limitChanged || descChanged || threadsChanged) { ctrl.pullPosts(threads); }
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

      if (threads) {
        Posts.pageStartedByUser(params).$promise
        .then(function(pageData) {
          ctrl.usersPosts = pageData.posts;
          ctrl.next = pageData.next;
          ctrl.prev = pageData.prev;
        });
      }
      else {
        Posts.pageByUser(params).$promise
        .then(function(pageData) {
          ctrl.pageCount = Math.ceil(pageData.count / pageData.limit);
          ctrl.usersPosts = pageData.posts;
        });
      }
    };

    this.toggleThreads = function(threads) {
      $location.search('page', 1);
      if (threads) {
        $location.search('threads', 'true');
      }
      else {
        $location.search('threads', 'false');
      }
      console.log($location.search());
      // Update queryParams (forces pagination to refresh)
      ctrl.queryParams = $location.search();
    }
  }
];

module.exports = angular.module('ept.profile.postsCtrl', [])
.controller('ProfilePostsCtrl', ctrl)
.name;
