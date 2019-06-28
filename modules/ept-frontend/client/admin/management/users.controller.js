var ctrl = ['$rootScope', '$scope', '$location', '$timeout', '$anchorScroll', '$filter', '$state', 'Session', 'Alert', 'User', 'Bans', 'User', 'users', 'usersCount', 'page', 'limit', 'field', 'desc', 'filter', 'search', 'ip', function($rootScope, $scope, $location, $timeout, $anchorScroll, $filter, $state, Session, Alert, User, Bans, User, users, usersCount, page, limit, field, desc, filter, search, ip) {
  var ctrl = this;
  this.parent = $scope.$parent.AdminManagementCtrl;
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
  this.searchStr = search;
  this.searchIps = ip;
  if (filter === 'banned') { this.tableFilter = 1; }

  this.ipRegex = /(^\s*((%|25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(%|25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(%|25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(%|25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))\s*$)/;

  // Action Control Access
  this.actionAccess = Session.getModPanelControlAccess();

  // Banning Vars
  this.showConfirmBanModal = false; // confirmation ban modal visible bool
  this.selectedUser = null; //  model backing selected user

  this.searchUsers = function() {
    if (!ctrl.searchStr.length) {
      ctrl.clearSearch();
      return;
    }
    ctrl.queryParams = {
      filter: ctrl.filter,
      field: 'username',
      search: ctrl.searchStr,
      ip: ctrl.searchIps ? 'true' : undefined
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
    User.get({ id: username }).$promise
    .then(function(userData) {
      ctrl.selectedUser = userData;
      // this is hacky.. but we need to pass joi validation when admins change emails
      ctrl.selectedUser.email_password = '********';
      ctrl.selectedUser.avatar = ctrl.selectedUser.avatar || '';
      ctrl.selectedUser.dob = $filter('date')(ctrl.selectedUser.dob, 'longDate');
      ctrl.showEditUserModal = true;
    });
  };

  this.closeEditUser = function() {
    ctrl.showEditUserModal = false;
    $timeout(function() { ctrl.selectedUser = null; }, 500); // dont remove user info till modal is out of view
  };

  this.saveUserEdit = function() {
    User.update(ctrl.selectedUser).$promise
    .then(function() { Alert.success('Successfully updated profile for ' + ctrl.selectedUser.username); })
    .catch(function(err) {
      var msg = 'There was an error updating user ' + ctrl.selectedUser.username;
      if (err && err.data && err.data.message) {
          msg += '. ' + err.data.message;
      }
      Alert.error(msg);
    })
    .finally(function() {
      ctrl.closeEditUser();
      ctrl.pullPage();
    });
  };

  this.showManageBans = function(user) {
    ctrl.selectedUser = user;
    ctrl.showConfirmBanModal = true;
  };

  this.updateViewBans = function(params) {
    // Loop reports and update ban info on reports with matching offender ids
    for (var i = 0; i < ctrl.users.length; i++) {
      if (params.user_id === ctrl.users[i].id) {
        // unbanning sets ban expiration to current time
        if (!params.banError && params.expiration) {
          var expiration = new Date(params.expiration) > new Date() ? params.expiration : undefined;
          ctrl.users[i].ban_expiration = expiration;
        }
      }
    }
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
    ctrl.searchIps = false;
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
    var desc = ctrl.desc === 'true'; // str to bool
    // Username is sorted asc by default
    if (sortField === 'username' && !ctrl.field && !desc) {
      sortClass = 'fa fa-sort-asc';
    }
    else if (ctrl.field === sortField && desc) {
      sortClass = 'fa fa-sort-desc';
    }
    else if (ctrl.field === sortField && !desc) {
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

    if((pageChanged || limitChanged || fieldChanged || descChanged || filterChanged || searchChanged) && $state.current.name === 'admin-management.users') { ctrl.pullPage(); }
  });
  $scope.$on('$destroy', function() { ctrl.offLCS(); });

  this.pullPage = function() {
    var query = {
      page: ctrl.page,
      limit: ctrl.limit,
      desc: ctrl.desc,
      field: ctrl.field,
      filter: ctrl.filter,
      search: ctrl.search,
      ip: ctrl.searchIps
    };

    var opts;
    if (ctrl.filter || ctrl.search) {
      opts = {
        filter: ctrl.filter,
        search: ctrl.search,
        ip: ctrl.searchIps
      };
    }

    // update users's page count
    User.count(opts).$promise
    .then(function(updatedCount) {
      ctrl.count = updatedCount.count;
      ctrl.pageCount = Math.ceil(updatedCount.count / limit);
    });

    // replace current users with new users
    User.page(query).$promise
    .then(function(updatedUsers) {
      ctrl.users = updatedUsers;
      $timeout($anchorScroll);
    });
  };
}];

require('../../modules/ept-images/image-uploader.directive');

module.exports = angular.module('ept.admin.management.users.ctrl', [])
.controller('UsersCtrl', ctrl);
