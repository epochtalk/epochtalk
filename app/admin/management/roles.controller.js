module.exports = ['$scope', 'AdminUsers', 'users', function($scope, AdminUsers, users) {
  var ctrl = this;
  this.parent = $scope.$parent;
  this.parent.tab = 'roles';
  this.roles = [
    { name: 'Super Administrator', description: 'Full access to all features' },
    { name: 'Administrator', description: 'Administrate all content except forum/general settings' },
    { name: 'Global Moderator', description: 'Moderate all boards and user roles' },
    { name: 'Moderator', description: 'Moderate specific boards and users of those boards' },
    { name: 'User', description: 'General forum access, allows posting and reading' },
    { name: 'Banned', description: 'Read only access, disallows content creation' },
    { name: 'Private', description: 'Users must login to view forum content, used for private forum settings' }
  ];
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

}];
