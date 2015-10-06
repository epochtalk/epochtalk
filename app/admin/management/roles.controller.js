module.exports = ['$scope', 'Alert', 'AdminRoles', 'AdminUsers', 'roles', 'users', function($scope, Alert, AdminRoles, AdminUsers, roles, users) {
  var ctrl = this;
  this.parent = $scope.$parent.AdminManagementCtrl;
  this.parent.tab = 'roles';
  this.roles = roles;
  this.backupPriorities = angular.copy(roles);

  this.selectedRoleName = null;
  this.roleUsers = null;
  this.selectRole = function(role) {
    if (ctrl.selectedRoleName === role.name) {
      ctrl.selectedRoleName = null;
      ctrl.roleUsers = null;
    }
    else {
      ctrl.selectedRoleName = role.name;
      ctrl.roleUsers = users;
    }
  };

  this.resetPriority = function() {
    ctrl.roles = angular.copy(ctrl.backupPriorities);
  };

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

  this.closeAddRole = function() {
    ctrl.showAddRoleModal = false;
  };

}];
