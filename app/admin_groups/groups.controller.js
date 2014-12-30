module.exports = ['$timeout', 'users', function($timeout, users) {
  var ctrl = this;

  //----------------------------------------------------- TO BE DELETED
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

  ctrl.groups[0].users = users.slice(0, 3);
  ctrl.groups[0].member_count = ctrl.groups[0].users.length;

  ctrl.groups[1].users = users.slice(4, 8);
  ctrl.groups[1].member_count = ctrl.groups[1].users.length;

  ctrl.groups[2].users = users.slice(10, 20);
  ctrl.groups[2].member_count = ctrl.groups[2].users.length;

  ctrl.groups[3].users = users;
  ctrl.groups[3].member_count = ctrl.groups[3].users.length;
  ctrl.groups[3].users = users.slice(0, 10);
  //-----------------------------------------------------  END TO BE DELETED

  this.toggles = {
    groups: false,
    active: false
  };

  this.activeGroup = this.groups[0]; // seleted group
  this.selectedUsers = {}; // holds users with checkmark checked

  this.setActiveGroup = function(group) {
    this.activeGroup = group;
    ctrl.selectedUsers = {};
  };

  this.selectAll = function() {
    this.activeGroup.users.forEach(function(user) {
      ctrl.selectedUsers[user.username] = !ctrl.selectedUsers[user.username];
    });
  };

  // Add members modal
  this.showAddMembers = false; // Triggers Modal Open/Close
  this.addMembersModalVisible = false; // Determines if modal is still in users view
  this.memberQuery = ''; // Model for adding user

  this.openAddMembersModal = function() {
    ctrl.showAddMembers = true;
    ctrl.addMembersModalVisible = true;
  };

  this.clearAddMembersFields = function() {
    $timeout(function() {
      ctrl.addMembersModalVisible = false; // Modal is out of view
      ctrl.memberQuery = '';
    }, 500);
  };


}];
