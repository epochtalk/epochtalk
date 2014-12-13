module.exports = ['users', function(users) {
  var ctrl = this;

  // Placeholder data
  this.groups = [{
    id: 1,
    name: 'Administrators',
    member_count: 3,
    permissions: 'Administrator Level',
  },
  {
    id: 2,
    name: 'Global Moderators',
    member_count: 4,
    permissions: 'Global Moderator Level',
  },
  {
    id: 3,
    name: 'Moderators',
    member_count: 10,
    permissions: 'Moderator Level',
  },
  {
    id: 4,
    name: 'Users',
    member_count: 76,
    permissions: 'User Level',
  }];

  // Placeholder data
  users.$promise
  .then(function(allUsers) {
    ctrl.groups[0].users = allUsers.slice(0, 3);
    ctrl.groups[0].member_count = ctrl.groups[0].users.length;

    ctrl.groups[1].users = allUsers.slice(4, 8);
    ctrl.groups[1].member_count = ctrl.groups[1].users.length;

    ctrl.groups[2].users = allUsers.slice(10, 20);
    ctrl.groups[2].member_count = ctrl.groups[2].users.length;

    ctrl.groups[3].users = allUsers;
    ctrl.groups[3].member_count = ctrl.groups[3].users.length;
    ctrl.groups[3].users = allUsers.slice(0, 10);

  });

  // the selected group
  this.activeGroup = this.groups[0];

}];
