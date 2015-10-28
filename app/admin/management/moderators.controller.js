var ctrl = ['$rootScope', '$scope', '$location', '$timeout', '$anchorScroll', 'Alert', 'Session', 'AdminUsers', 'moderators', 'moderatorsCount', 'page', 'limit', 'field', 'desc', 'USER_ROLES', function($rootScope, $scope, $location, $timeout, $anchorScroll, Alert, Session, AdminUsers, moderators, moderatorsCount, page, limit, field, desc, USER_ROLES) {
  var ctrl = this;
  this.parent = $scope.$parent.AdminManagementCtrl;
  this.parent.tab = 'moderators';
  this.count = moderatorsCount;
  this.pageCount =  Math.ceil(moderatorsCount / limit);
  this.moderators = moderators;
  this.queryParams = $location.search();
  this.page = page;
  this.limit = limit;
  this.field = field;
  this.desc = desc;

  this.user = Session.user;
  this.selectedUser = null; // User being added/deleted

  // Adding moderator
  this.showConfirmAddModal = false; // confirmation modal visible bool
  this.roleAddSubmitted = false; // form submitted bool
  this.selectedRole = null; //  model backing selected role (global or reg mod)
  this.confirmAddBtnLabel = 'Confirm'; // modal button label

  this.showConfirmAdd = function(user) {
    ctrl.selectedUser = user;
    ctrl.showConfirmAddModal = true;
  };

  this.closeConfirmAdd = function() {
    ctrl.selectedUser = null;
    ctrl.selectedRole = null;
    ctrl.showConfirmAddModal = false;

    $timeout(function() { // wait for modal to close
      ctrl.confirmAddBtnLabel = 'Confirm';
      ctrl.roleAddSubmitted = false;
    }, 1000);
  };

  this.addModerator = function() {
    ctrl.confirmAddBtnLabel = 'Loading...';
    ctrl.roleAddSubmitted = true;
    var hasModRole = false;
    ctrl.selectedUser.roles.forEach(function(role) {
      if (role.name === USER_ROLES.mod || role.name === USER_ROLES.globalMod) { hasModRole = true; }
    });

    if (hasModRole) {
      Alert.warning(ctrl.selectedUser.username + ' is already in the list of moderators');
      ctrl.closeConfirmAdd();
    }
    else {
      var roles = [ USER_ROLES.mod ]; // default to mod role
      if (ctrl.selectedRole === USER_ROLES.globalMod) { // Append global mod role if selected
        roles.push(USER_ROLES.globalMod);
      }
      var params = {
        user_id: ctrl.selectedUser.id,
        roles: roles
      };
      AdminUsers.addRoles(params).$promise
      .then(function() {
        Alert.success(ctrl.selectedUser.username + ' has been added as a ' + ctrl.selectedRole);
        ctrl.closeConfirmAdd();
        ctrl.pullPage();
      });
    }
  };

  // Removing moderator
  this.showConfirmRemoveModal = false;
  this.roleRemoveSubmitted = false;
  this.confirmRemoveBtnLabel = 'Confirm';

  this.showConfirmRemove = function(user) {
    ctrl.selectedUser = user;
    ctrl.showConfirmRemoveModal = true;
  };

  this.closeConfirmRemove = function() {
    ctrl.selectedUser = null;

    $timeout(function() { // wait for modal to close
      ctrl.confirmRemoveBtnLabel = 'Confirm';
      ctrl.roleRemoveSubmitted = false;
    }, 1000);
    // fix for modal not opening after closing
    $timeout(function() { ctrl.showConfirmRemoveModal = false; });
  };

  this.removeModerator = function() {
    ctrl.confirmRemoveBtnLabel = 'Loading...';
    ctrl.roleRemoveSubmitted = true;
    var params = {
      user_id: ctrl.selectedUser.user_id,
      roles: ctrl.selectedUser.roles
    };
    AdminUsers.removeRoles(params).$promise
    .then(function() {
      Alert.success(ctrl.selectedUser.username + ' has been removed from moderators');
      ctrl.pullPage();
      ctrl.closeConfirmRemove();
    });
  };

  // Toggling role with switch
  this.toggleGlobalMod = function(userId, setGlobalMod) {
    var params = {
      user_id: userId,
      roles: [ USER_ROLES.globalMod ]
    };
    var promise;
    if (setGlobalMod) { promise = AdminUsers.addRoles(params).$promise; }
    else { promise = AdminUsers.removeRoles(params).$promise; }
    promise.then(function() {
      ctrl.pullPage();
    });
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

  this.isGlobalMod = function(roles) {
    return roles.indexOf(USER_ROLES.globalMod) > -1;
  };

  $timeout($anchorScroll);

  this.offLCS = $rootScope.$on('$locationChangeSuccess', function(){
    var params = $location.search();
    var page = Number(params.page) || 1;
    var limit = Number(params.limit) || 25;
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

    // update mods's page count
    AdminUsers.countModerators().$promise
    .then(function(updatedCount) {
      ctrl.count = updatedCount.count;
      ctrl.pageCount = Math.ceil(updatedCount.count / limit);
    });

    // replace current mods with new mods
    AdminUsers.pageModerators(query).$promise
    .then(function(newModerators) {
      ctrl.moderators = newModerators;
    });
  };
}];

module.exports = angular.module('ept.admin.management.moderators.ctrl', [])
.controller('ModeratorsCtrl', ctrl)
.name;
