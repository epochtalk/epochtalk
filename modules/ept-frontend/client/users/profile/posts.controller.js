var ctrl = ['user', 'pageData', 'Posts', '$location', '$scope', '$rootScope', '$state', '$anchorScroll',
  function(user, pageData, Posts, $location, $scope, $rootScope, $state, $anchorScroll) {
    var ctrl = this;
    this.user = angular.copy(user);
    this.pageCount = Math.ceil(pageData.count / pageData.limit);
    this.queryParams = $location.search();
    this.page = pageData.page;
    this.limit = pageData.limit;
    this.desc = pageData.sortDesc || true; // default to true
    this.usersPosts = pageData.posts;
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

    this.offLCS = $rootScope.$on('$locationChangeSuccess', function() {
      var params = $location.search();
      var page = Number(params.page) || 1;
      var limit = Number(params.limit) || 25;
      var descending;

      if (params.desc === false) { descending = false; }
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

      if((pageChanged || limitChanged || descChanged) && ($state.current.name === 'users-posts' || $state.current.name === 'profile.posts')) {
        ctrl.pullPage(); }
    });
    $scope.$on('$destroy', function() { ctrl.offLCS(); });

    this.pullPage = function() {
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
  }
];

module.exports = angular.module('ept.profile.postsCtrl', [])
.controller('ProfilePostsCtrl', ctrl)
.name;
