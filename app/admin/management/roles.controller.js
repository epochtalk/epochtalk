module.exports = ['$rootScope', '$scope', '$location', 'Alert', 'AdminRoles', 'AdminUsers', 'roles', 'userData', 'roleId', 'limit', 'page', function($rootScope, $scope, $location, Alert, AdminRoles, AdminUsers, roles, userData, roleId, limit, page) {
  var ctrl = this;
  this.parent = $scope.$parent.AdminManagementCtrl;
  this.parent.tab = 'roles';
  this.roles = roles;
  this.backupPriorities = angular.copy(roles);
  this.queryParams = $location.search();
  this.pageCount = Math.ceil(userData.count / limit);
  this.page = page;
  this.limit = limit;
  this.userData = userData;
  this.roleId = roleId;
  this.selectedRole = null;

  this.selectRole = function(role) {
    // reset defaults when deselecting or reselecting
    this.page = page;
    this.limit = limit;
    if (ctrl.selectedRole && ctrl.selectedRole.name === role.name) {
      ctrl.selectedRole = null;
      ctrl.userData = null;
      ctrl.queryParams = {};
      $location.search(ctrl.queryParams);
    }
    else {
      ctrl.selectedRole = role;
      ctrl.queryParams = { roleId: role.id };
      $location.search(ctrl.queryParams);
    }
  };

  // Assign selected role if view is visited with roleId query param
  if (roleId) {
    roles.forEach(function(role) {
      if (roleId === role.id) {
        ctrl.selectedRole = role;
        $location.search(ctrl.queryParams);
      }
      if (role.lookup === 'user') {
        role.message = 'The ' + role.name + ' role is assigned by default.  By default all new registered users are considered users.  The userbase of this role may not be manually edited.  Permission changes to this role will affect all users without another role assigned.';
      }
      if (role.lookup === 'anonymous') {
        role.message = 'The ' + role.name + ' role is assigned by default to forum visitors who are not authenticated.  The user base of this role may not be manually edited.  Permission changes to this role will affect all unauthenticated users visiting the forum.';
      }
      if (role.lookup === 'private') {
        role.message = 'The ' + role.name + ' role is assigned by default to forum visitors who are not authenticated.  This role is only used if the "Public Forum" is set to off via the forum settings page.  This requires all visitors to log in before they can view the forum content.  The user base of this role may not be manually edited.  Permission changes to this role will affect all unauthenticated users visiting the forum.';
      }
    });
  }

  this.resetPriority = function() { ctrl.roles = angular.copy(ctrl.backupPriorities); };

  this.savePriority = function() {
    AdminRoles.reprioritize(ctrl.roles).$promise
    .then(function() {
      Alert.success('Roles successfully reprioritized');
      ctrl.backupPriorities = angular.copy(ctrl.roles);
    })
    .catch(function() {
      Alert.error('There was an error reprioritizing the roles');
    });
  };

  this.reprioritizeRoles = function() {
    var priority = 0;
    ctrl.roles.forEach(function(role) {
      role.priority = priority++;
    });
  };

  this.showAddRoleModal = false;
  this.selectedTab = null;
  this.showAddRole = function() {
    ctrl.showAddRoleModal = true;
    ctrl.selectedTab = 'user';
  };

  this.closeAddRole = function() { ctrl.showAddRoleModal = false; };

  this.offLCS = $rootScope.$on('$locationChangeSuccess', function() {
    var params = $location.search();
    var page = Number(params.page) || 1;
    var limit = Number(params.limit) || 15;
    var roleId = params.roleId;
    var roleIdChanged = false;
    var pageChanged = false;
    var limitChanged = false;
    if (page && page !== ctrl.page) {
      pageChanged = true;
      ctrl.page = page;
    }
    if (limit && limit !== ctrl.limit) {
      limitChanged = true;
      ctrl.limit = limit;
    }
    if (roleId && roleId !== ctrl.roleId) {
      roleIdChanged = true;
      ctrl.roleId = roleId;
    }
    if (!roleId) { ctrl.roleId = null; } // allows deselection of role

    if(pageChanged || limitChanged || roleIdChanged) { ctrl.pullPage(); }
  });
  $scope.$on('$destroy', function() { ctrl.offLCS(); });

  this.pullPage = function() {
    var query = {
      id: ctrl.roleId,
      page: ctrl.page,
      limit: ctrl.limit
    };
    if (ctrl.roleId) {
      AdminRoles.users(query).$promise
      .then(function(updatedUserData) {
        ctrl.userData = updatedUserData;
        ctrl.pageCount = Math.ceil(updatedUserData.count / query.limit);
      });
    }
  };

}];
