module.exports = ['$rootScope', '$scope', '$location', '$timeout', '$anchorScroll', '$filter', 'Alert', 'AdminUsers', 'users', 'usersCount', 'page', 'limit', 'field', 'desc', 'filter', 'search', function($rootScope, $scope, $location, $timeout, $anchorScroll, $filter, Alert, AdminUsers, users, usersCount, page, limit, field, desc, filter, search) {
  var ctrl = this;
  this.parent = $scope.$parent;
  this.parent.tab = 'users';
  this.count = usersCount;
  this.pageCount =  Math.ceil(usersCount / limit);
  this.users = users;
  this.queryParams = $location.search();
  this.page = page;
  this.limit = limit;
  this.field = field;
  this.desc = desc;
  this.filter = filter;
  this.tableFilter = 0;
  this.search = search;
  this.searchStr = null;
  if (filter === 'banned') { this.tableFilter = 1; }

  // Banning Vars
  this.showConfirmBanModal = false; // confirmation ban modal visible bool
  this.showConfirmUnbanModal = false; // confirmation unban modal visible bool
  this.banSubmitted = false; // form submitted bool
  this.selectedUser = null; //  model backing selected user
  this.confirmBanBtnLabel = 'Confirm'; // modal button label
  this.permanentBan = undefined; // boolean indicating if ban is permanent
  this.banUntil = null; // model

  this.searchUsers = function() {
    if (!ctrl.searchStr.length) {
      ctrl.clearSearch();
      return;
    }
    ctrl.queryParams = {
      filter: ctrl.filter,
      field: 'username',
      search: ctrl.searchStr
    };
    $location.search(ctrl.queryParams);
  };

  this.clearSearch = function() {
    ctrl.queryParams = {
      field: 'username',
      filter: ctrl.filter
    };
    $location.search(ctrl.queryParams);
    ctrl.searchStr = null;
  };

  // Edit Profile Vars
  this.showEditUserModal = false;

  this.showEditUser = function(username) {
    AdminUsers.find({ username: username }).$promise
    .then(function(userData) {
      ctrl.selectedUser = userData;
      ctrl.selectedUser.dob = $filter('date')(ctrl.selectedUser.dob, 'longDate');
      ctrl.showEditUserModal = true;
    });
  };

  this.closeEditUser = function() {
    ctrl.showEditUserModal = false;
    $timeout(function() { ctrl.selectedUser = null; }, 500); // dont remove user info till modal is out of view
  };

  this.saveUserEdit = function() {
    AdminUsers.update(ctrl.selectedUser).$promise
    .then(function() {
      ctrl.closeEditUser();
      Alert.success('Successfully updated profile for ' + ctrl.selectedUser.username);
    })
    .catch(function() { Alert.error('There was an error updating user ' + ctrl.selectedUser.username); });
  };

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
    .then(function(ban) {
      if (ctrl.tableFilter === 0) { ctrl.pullPage(); }
      else { ctrl.selectedUser.ban_expiration = ban.expiration; }
      Alert.success(ctrl.selectedUser.username + ' has been banned');
      ctrl.closeConfirmBan();
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
      if (ctrl.tableFilter === 0) { ctrl.pullPage(); }
      else { ctrl.selectedUser.ban_expiration = null; }
      Alert.success(ctrl.selectedUser.username + ' has been unbanned');
      ctrl.closeConfirmUnban();
      $timeout(function() { // wait for modal to close
        ctrl.confirmBanBtnLabel = 'Confirm';
        ctrl.banSubmitted = false;
      }, 500);
    });
  };

  this.setFilter = function(newFilter) {
    ctrl.users = null;
    ctrl.queryParams = {
      filter: newFilter,
      field: 'username'
    };
    $location.search(ctrl.queryParams);
    ctrl.selectedUser = null;
    ctrl.searchStr = null;
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
    var limit = Number(params.limit) || 15;
    var field = params.field;
    var filter = params.filter;
    var search = params.search;
    var descending = params.desc === 'true';
    var pageChanged = false;
    var limitChanged = false;
    var fieldChanged = false;
    var descChanged = false;
    var filterChanged = false;
    var searchChanged = false;

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
    if ((search === undefined || search) && search !== ctrl.search) {
      searchChanged = true;
      ctrl.search = search;
    }

    if(pageChanged || limitChanged || fieldChanged || descChanged || filterChanged || searchChanged) { ctrl.pullPage(); }
  });
  $scope.$on('$destroy', function() { ctrl.offLCS(); });

  this.pullPage = function() {
    var query = {
      page: ctrl.page,
      limit: ctrl.limit,
      desc: ctrl.desc,
      field: ctrl.field,
      filter: ctrl.filter,
      search: ctrl.search
    };

    var opts;
    if (ctrl.filter || ctrl.search) {
      opts = {
        filter: ctrl.filter,
        search: ctrl.search
      };
    }

    // update users's page count
    AdminUsers.count(opts).$promise
    .then(function(updatedCount) {
      ctrl.count = updatedCount.count;
      ctrl.pageCount = Math.ceil(updatedCount.count / limit);
    });

    // replace current users with new users
    AdminUsers.page(query).$promise
    .then(function(updatedUsers) {
      ctrl.users = updatedUsers;
    });
  };
}];
