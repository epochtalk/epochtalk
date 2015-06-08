module.exports = ['$rootScope', '$scope', '$location', '$timeout', '$anchorScroll', 'AdminUsers', 'users', 'usersCount', 'page', 'limit', 'field', 'desc', 'filter', function($rootScope, $scope, $location, $timeout, $anchorScroll, AdminUsers, users, usersCount, page, limit, field, desc, filter) {
  var ctrl = this;
  this.parent = $scope.$parent;
  this.parent.tab = 'users';
  this.pageCount =  Math.ceil(usersCount / limit);
  this.users = users;
  this.queryParams = $location.search();
  this.page = page;
  this.limit = limit;
  this.field = field;
  this.desc = desc;
  this.filter = filter;
  this.tableFilter = 0;
  if (filter === 'banned') { this.tableFilter = 1; }

  // Banning Vars
  this.showConfirmBanModal = false; // confirmation ban modal visible bool
  this.showConfirmUnbanModal = false; // confirmation unban modal visible bool
  this.banSubmitted = false; // form submitted bool
  this.selectedUser = null; //  model backing selected user
  this.confirmBanBtnLabel = 'Confirm'; // modal button label
  this.permanentBan = undefined; // boolean indicating if ban is permanent
  this.banUntil = null; // model

  this.minDate = function() {
    var d = new Date();
    var month = '' + (d.getMonth() + 1);
    var day = '' + d.getDate();
    var year = d.getFullYear();
    if (month.length < 2) { month = '0' + month; }
    if (day.length < 2) { day = '0' + day; }
    return [year, month, day].join('-');
  };

  this.showBanConfirm = function(user) {
    ctrl.selectedUser = user;
    ctrl.showConfirmBanModal = true;
  };

  this.closeConfirmBan = function() {
    ctrl.selectedUser = null;
    ctrl.permanentBan = undefined;
    ctrl.banUntil = null;

    // Fix for modal not opening after closing
    $timeout(function() { ctrl.showConfirmBanModal = false; });
  };

  this.banUser = function() {
    ctrl.confirmBanBtnLabel = 'Loading...';
    ctrl.banSubmitted = true;
    var params = {
      user_id: ctrl.selectedUser.id,
      expiration: ctrl.banUntil || undefined
    };
    AdminUsers.ban(params).$promise
    .then(function() {
      ctrl.closeConfirmBan();
      ctrl.pullPage();
      $timeout(function() { // wait for modal to close
        ctrl.confirmBanBtnLabel = 'Confirm';
        ctrl.banSubmitted = false;
      }, 500);
    });
  };

  this.showUnbanConfirm = function(user) {
    ctrl.selectedUser = user;
    ctrl.showConfirmUnbanModal = true;
  };

  this.closeConfirmUnban = function() {
    ctrl.selectedUser = null;
    // Fix for modal not opening after closing
    $timeout(function() { ctrl.showConfirmUnbanModal = false; });
  };

  this.unbanUser = function() {
    ctrl.confirmBanBtnLabel = 'Loading...';
    ctrl.banSubmitted = true;
    var params = {
      user_id: ctrl.selectedUser.id,
    };
    AdminUsers.unban(params).$promise
    .then(function() {
      ctrl.closeConfirmUnban();
      ctrl.pullPage();
      $timeout(function() { // wait for modal to close
        ctrl.confirmBanBtnLabel = 'Confirm';
        ctrl.banSubmitted = false;
      }, 500);
    });
  };

  this.setFilter = function(newFilter) {
    ctrl.queryParams = {
      filter: newFilter,
      field: 'username'
    };
    $location.search(ctrl.queryParams);
    ctrl.selectedUser = null;
  };

  this.setSortField = function(sortField) {
    // Sort Field hasn't changed just toggle desc
    var unchanged = sortField === ctrl.field || (sortField === 'username' && !ctrl.field);
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
    var sortDesc = ctrl.desc === 'true'; // str to bool
    // Username is sorted asc by default
    if (sortField === 'username' && !ctrl.field && !sortDesc) {
      sortClass = 'fa fa-sort-asc';
    }
    else if (ctrl.field === sortField && sortDesc) {
      sortClass = 'fa fa-sort-desc';
    }
    else if (ctrl.field === sortField && !sortDesc) {
      sortClass = 'fa fa-sort-asc';
    }
    else { sortClass = 'fa fa-sort'; }
    return sortClass;
  };

  $timeout($anchorScroll);

  this.offLCS = $rootScope.$on('$locationChangeSuccess', function() {
    var params = $location.search();
    var page = Number(params.page) || 1;
    var limit = Number(params.limit) || 10;
    var field = params.field;
    var filter = params.filter;
    var descending = params.desc === 'true';
    var pageChanged = false;
    var limitChanged = false;
    var fieldChanged = false;
    var descChanged = false;
    var filterChanged = false;

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
    if ((filter === undefined || filter) && filter !== ctrl.filter) {
      filterChanged = true;
      ctrl.filter = filter;
    }

    if(pageChanged || limitChanged || fieldChanged || descChanged || filterChanged) { ctrl.pullPage(); }
  });
  $scope.$on('$destroy', function() { ctrl.offLCS(); });

  this.pullPage = function() {
    var query = {
      page: ctrl.page,
      limit: ctrl.limit,
      desc: ctrl.desc,
      field: ctrl.field,
      filter: ctrl.filter
    };

    var opts;
    if (ctrl.filter) {
      opts = { filter: ctrl.filter };
    }

    // update users's page count
    AdminUsers.count(opts).$promise
    .then(function(updatedCount) {
      ctrl.pageCount = Math.ceil(updatedCount.count / limit);
    });

    // replace current users with new users
    AdminUsers.page(query).$promise
    .then(function(updatedUsers) {
      ctrl.users = updatedUsers;
    });
  };
}];
