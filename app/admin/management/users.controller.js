module.exports = ['$rootScope', '$scope', '$location', '$timeout', '$anchorScroll', 'AdminUsers', 'users', 'usersCount', 'page', 'limit', 'field', 'desc', function($rootScope, $scope, $location, $timeout, $anchorScroll, AdminUsers, users, usersCount, page, limit, field, desc) {
  var ctrl = this;
  this.parent = $scope.$parent;
  this.parent.tab = 'users';
  this.usersCount =  Math.ceil(usersCount / limit);
  this.users = users;
  this.queryParams = $location.search();
  this.page = page;
  this.limit = limit;
  this.field = field;
  this.desc = desc;

  this.setSortField = function(sortField) {
    // Sort Field hasn't changed just toggle desc
    if (sortField === ctrl.field || (sortField === 'username' && !ctrl.field)) {
      ctrl.desc = ctrl.desc === 'true' ? 'false' : 'true';
    }
    // Sort Field changed default to ascending order
    else { ctrl.desc = 'false'; }
    ctrl.field = sortField;
    $location.search('desc', ctrl.desc);
    $location.search('field', sortField);

    // Update queryParams (forces pagination to refresh)
    ctrl.queryParams = $location.search();
  };

  this.getSortClass = function(sortField) {
    var sortClass;
    var sortDesc = ctrl.desc === 'true';
    // Username is sorted asc by default
    if (sortField === 'username' && !ctrl.field && !sortDesc) {
      sortClass = 'sort-asc';
    }
    else if (ctrl.field === sortField && sortDesc) {
      sortClass = 'sort-desc';
    }
    else if (ctrl.field === sortField && !sortDesc) {
      sortClass = 'sort-asc';
    }
    else { sortClass = 'sort'; }
    return sortClass;
  };

  $timeout($anchorScroll);

  this.offLCS = $rootScope.$on('$locationChangeSuccess', function(){
    var params = $location.search();
    var page = Number(params.page) || 1;
    var limit = Number(params.limit) || 10;
    var field = params.field;
    var descending = params.desc === 'true';
    var pageChanged = false;
    var limitChanged = false;
    var fieldChanged = false;
    var descChanged = false;

    if (page && page !== ctrl.page) {
      pageChanged = true;
      ctrl.parent.page = page;
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
    var query = {
      page: ctrl.page,
      limit: ctrl.limit
    };

    if (ctrl.desc) { query.desc = ctrl.desc; }
    if (ctrl.field) { query.field = ctrl.field; }

    // update users's thread page count
    AdminUsers.count().$promise
    .then(function(updatedCount) {
      ctrl.usersCount = Math.ceil(updatedCount.count / limit);
    });

    // replace current users with new users
    AdminUsers.page(query).$promise
    .then(function(users) {
      ctrl.users = users;
      $timeout($anchorScroll);
    });
  };
}];
