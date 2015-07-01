module.exports = ['user', 'usersPosts', 'usersPostsCount', 'limit', 'page', 'field', 'desc', 'Posts', '$location', '$scope', '$rootScope', '$state', '$anchorScroll',
  function(user, usersPosts, usersPostsCount, limit, page, field, desc, Posts, $location, $scope, $rootScope, $state, $anchorScroll) {
    var ctrl = this;
    this.user = angular.copy(user);
    this.pageCount = Math.ceil(usersPostsCount / limit);
    this.queryParams = $location.search();
    this.page = page;
    this.limit = limit;
    this.field = field;
    this.desc = desc;
    this.usersPosts = usersPosts;

    if ($state.current.name === 'users-posts') { $anchorScroll(); }

    this.setSortField = function(sortField) {
      // Sort Field hasn't changed just toggle desc
      var unchanged = sortField === ctrl.field;
      if (unchanged) { ctrl.desc = ctrl.desc === 'true' ? 'false' : 'true'; } // bool to str
      // Sort Field changed default to ascending order
      else { ctrl.desc = 'false'; }
      ctrl.field = sortField;
      ctrl.page = 1;
      $location.search('page', ctrl.page);
      $location.search('desc', ctrl.desc);
      $location.search('field', sortField);
      // Update queryParams (forces pagination to refresh)
      ctrl.queryParams = $location.search();
    };

    this.getSortClass = function(sortField) {
      var sortClass;
      var sortDesc;
      // if desc param is undefined default to true if sorting by created_at
      if ($location.search().desc === undefined && sortField === 'created_at') { sortDesc = true; }
      else { sortDesc = ctrl.desc === 'true'; }
      // created_at is sorted desc by default when ctrl.field is not present
      if (sortField === 'created_at' && !ctrl.field && sortDesc) { sortClass = 'fa fa-sort-desc'; }
      else if (ctrl.field === sortField && sortDesc) { sortClass = 'fa fa-sort-desc'; }
      else if (ctrl.field === sortField && !sortDesc) { sortClass = 'fa fa-sort-asc'; }
      else { sortClass = 'fa fa-sort'; }
      return sortClass;
    };

    this.offLCS = $rootScope.$on('$locationChangeSuccess', function() {
      var params = $location.search();
      var page = Number(params.page) || 1;
      var limit = Number(params.limit) || 10;
      var field = params.field;
      var descending;
      // desc when undefined defaults to true, since we are sorting created_at desc by default
      if (params.desc === undefined) { descending = true; }
      else { descending = params.desc === 'true'; }
      var pageChanged = false;
      var limitChanged = false;
      var fieldChanged = false;
      var descChanged = false;

      if (page && page !== ctrl.page) {
        pageChanged = true;
        ctrl.page = page;
      }
      if (limit && limit !== ctrl.limit) {
        limitChanged = true;
        ctrl.limit = limit;
      }
      if (field && field !== ctrl.field) {
        fieldChanged = true;
        ctrl.field = field;
      }
      if (descending !== ctrl.desc) {
        descChanged = true;
        ctrl.desc = descending.toString();
      }
      if(pageChanged || limitChanged || fieldChanged || descChanged) { ctrl.pullPage(); }
    });
    $scope.$on('$destroy', function() { ctrl.offLCS(); });

    this.pullPage = function() {
      var params = {
        username: ctrl.user.username,
        page: ctrl.page,
        limit: ctrl.limit,
        desc: ctrl.desc,
        field: ctrl.field
      };

      // update user post's page count
      Posts.pageByUserCount({ username: params.username }).$promise
      .then(function(updatedCount) {
        ctrl.pageCount = Math.ceil(updatedCount.count / limit);
      });

      // replace current user post with new user posts
      Posts.pageByUser(params).$promise
      .then(function(newPosts) {
        ctrl.usersPosts = newPosts;
      });

      delete params.username;

      // Reload state with new params
      $state.go('.', params, { location: false });
    };
  }
];
