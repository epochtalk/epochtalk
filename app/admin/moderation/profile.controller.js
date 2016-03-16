var ctrl = ['user', 'User', 'Session', 'Alert', '$timeout', '$filter', '$state', '$location',
  function(user, User, Session, Alert, $timeout, $filter, $state, $location) {
    var ctrl = this;
    this.user = user;
    this.displayUser = angular.copy(user);
    this.displayUser.avatar = this.displayUser.avatar || 'https://fakeimg.pl/400x400/ccc/444/?text=' + this.displayUser.username;
    this.user.dob = $filter('date')(this.user.dob, 'longDate');
    this.user.post_count = this.user.post_count || 0;
    this.user.raw_signature = this.user.raw_signature || this.user.signature;
    // This isn't the profile users true local time, just a placeholder
    this.userLocalTime = $filter('date')(Date.now(), 'h:mm a (Z)');

    var calcAge = function(dob) {
      if (!dob) { return '';}
      dob = new Date(dob);
      var ageDiff = Date.now() - dob.getTime();
      var ageDate = new Date(ageDiff);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    };
    this.userAge = calcAge(this.displayUser.dob);

    // Permission (deprecated)
    this.controlAccess = Session.getControlAccessWithPriority('users', user.priority);
    this.controlAccess.privilegedBan = Session.hasPermission('adminUsers.privilegedBan');

    // Permissions
    this.pageOwner = Session.user.id === user.id;
    this.pagePriority = ctrl.user.priority;
    this.viewerPriority = Session.getPriority();

    this.canUpdate = function() {
      var valid = false;
      if (!Session.isAuthenticated()) { return false; }
      if (!Session.hasPermission('users.update.allow')) { return false; }

      var same = Session.hasPermission('users.update.bypass.priority.admin');
      var lower = Session.hasPermission('users.update.bypass.priority.mod');

      if (ctrl.pageOwner) { valid = true; }
      else if (same) { valid = ctrl.viewerPriority <= ctrl.pagePriority; }
      else if (lower) { valid = ctrl.viewerPriority < ctrl.pagePriority; }

      return valid;
    };

    this.canUpdatePassword = function() { return ctrl.canUpdate() && ctrl.pageOwner; };

    this.canDeactivate = function() {
      var valid = false;
      if (!Session.isAuthenticated()) { return false; }
      if (!Session.hasPermission('users.deactivate.allow')) { return false; }
      if (ctrl.user.deleted) { return false; }

      var same = Session.hasPermission('users.deactivate.bypass.priority.admin');
      var lower = Session.hasPermission('users.deactivate.bypass.priority.mod');

      if (ctrl.pageOwner) { valid = true; }
      else if (same) { valid = ctrl.viewerPriority <= ctrl.pagePriority; }
      else if (lower) { valid = ctrl.viewerPriority < ctrl.pagePriority; }

      return valid;
    };

    this.canReactivate = function() {
      var valid = false;
      if (!Session.isAuthenticated()) { return false; }
      if (!Session.hasPermission('users.reactivate.allow')) { return false; }
      if (!ctrl.user.deleted) { return false; }

      var same = Session.hasPermission('users.reactivate.bypass.priority.admin');
      var lower = Session.hasPermission('users.reactivate.bypass.priority.mod');

      if (ctrl.pageOwner) { valid = true; }
      else if (same) { valid = ctrl.viewerPriority <= ctrl.pagePriority; }
      else if (lower) { valid = ctrl.viewerPriority < ctrl.pagePriority; }

      return valid;
    };

    this.canDelete = function() {
      var valid = false;
      if (!Session.isAuthenticated()) { return false; }
      if (!Session.hasPermission('users.delete.allow')) { return false; }

      var same = Session.hasPermission('users.delete.bypass.priority.admin');
      var lower = Session.hasPermission('users.delete.bypass.priority.mod');

      if (ctrl.pageOwner) { valid = true; }
      else if (same) { valid = ctrl.viewerPriority <= ctrl.pagePriority; }
      else if (lower) { valid = ctrl.viewerPriority < ctrl.pagePriority; }

      return valid;
    };

    // Check if user is banned
    this.ban_expiration = null;
    if (this.controlAccess.privilegedBan && this.user.ban_expiration && new Date(this.user.ban_expiration) > new Date()) {
      this.ban_expiration = $filter('humanDate')(this.user.ban_expiration, true);
    }

    // Edit Profile
    this.editProfile = false;
    this.saveProfile = function() {
      var changeProfileUser = {
        username: ctrl.user.username,
        name: ctrl.user.name,
        email: ctrl.user.email,
        website: ctrl.user.website,
        btcAddress: ctrl.user.btcAddress,
        gender: ctrl.user.gender,
        dob: ctrl.user.dob,
        location: ctrl.user.location,
        language: ctrl.user.language
      };

      User.update({ id: ctrl.user.id }, changeProfileUser).$promise
      .then(function(data) {
        Alert.success('Successfully saved profile');
        // redirect page if username changed
        if (ctrl.displayUser.username !== data.username) {
          if (ctrl.pageOwner) { Session.setUsername(ctrl.user.username); }
          var params = { username: ctrl.user.username};
          $state.go('profile', params, { location: true, reload: false });
        }
        else { ctrl.updateDisplayUser(data); }
      })
      .catch(function() { Alert.error('Profile could not be updated'); })
      .finally(function() { ctrl.closeEditProfile(true); });
    };

    this.closeEditProfile = function(saved) {
      // fix for modal not opening after closing
     $timeout(function() { ctrl.editProfile = false; });
      if (!saved) { // reset user info if not saved
        $timeout(function() { ctrl.updateDisplayUser(ctrl.displayUser); }, 500);
      }
    };

    // Edit Avatar
    this.editAvatar = false;
    this.saveAvatar = function() {
      var changeAvatarUser = {
        username: ctrl.user.username,
        avatar: ctrl.user.avatar,
      };

      User.update({ id: ctrl.user.id }, changeAvatarUser).$promise
      .then(function(data) {
        ctrl.updateDisplayUser(data);
        ctrl.displayUser.avatar = ctrl.displayUser.avatar || 'https://fakeimg.pl/400x400/ccc/444/?text=' + ctrl.displayUser.username;
        if(ctrl.pageOwner) { Session.setAvatar(ctrl.displayUser.avatar); }
        Alert.success('Successfully updated avatar');
      })
      .catch(function() { Alert.error('Avatar could not be updated'); })
      .finally(function() { ctrl.closeEditAvatar(); });
    };

    this.closeEditAvatar = function() {
      // fix for modal not opening after closing
      $timeout(function() { ctrl.editAvatar = false; });
    };

    // Edit Signature
    this.editSignature = false;
    this.saveSignature = function() {
      var changeSigUser = {
        username: ctrl.user.username,
        raw_signature: ctrl.user.raw_signature
      };

      User.update({ id: ctrl.user.id }, changeSigUser).$promise
      .then(function(data) {
        ctrl.updateDisplayUser(data);
        Alert.success('Successfully updated signature');
      })
      .catch(function() { Alert.error('Signature could not be updated'); })
      .finally(function() { ctrl.closeEditSignature(); });
    };

    this.closeEditSignature = function() {
      // fix for modal not opening after closing
      $timeout(function() { ctrl.editSignature = false; });
    };

    // Edit Password
    this.editPassword = false;
    this.passData = { username: ctrl.user.username };
    this.clearPasswordFields = function() {
      $timeout(function() {
        ctrl.passData = { id: ctrl.user.id, username: ctrl.user.username };
      }, 500);
    };

    this.savePassword = function() {
      User.update({ id: ctrl.user.id }, ctrl.passData).$promise
      .then(function() {
        ctrl.clearPasswordFields();
        Alert.success('Sucessfully changed account password');
      })
      .catch(function() { Alert.error('Error updating password'); })
      .finally(function() { ctrl.editPassword = false; });
    };

    this.updateDisplayUser = function(data) {
      ctrl.displayUser = angular.copy(data);

      // These fields are not returned upon update
      ctrl.displayUser.post_count = ctrl.user.post_count || 0;
      ctrl.displayUser.created_at = ctrl.user.created_at;
      ctrl.displayUser.updated_at = ctrl.user.updated_at;

      ctrl.user = data;
      ctrl.user.dob = $filter('date')(ctrl.user.dob, 'longDate');
      ctrl.userAge = calcAge(ctrl.user.dob);

      // Add back created_at, updated_at and post count to user
      ctrl.user.post_count = ctrl.displayUser.post_count;
      ctrl.user.created_at = ctrl.displayUser.created_at;
      ctrl.user.updated_at = ctrl.displayUser.updated_at;
    };

    // Deactivate account
    this.showDeactivate = false;
    this.closeDeactivateModal = function() {
      $timeout(function() { ctrl.showDeactivate = false; });
    };
    this.openDeactivateModal = function() { ctrl.showDeactivate = true; };
    this.deactivateUser = function() {
      User.deactivate({ id: ctrl.user.id }).$promise
      .then(function() {
        ctrl.user.deleted = true;
        Alert.success('Account Deactivated.');
      })
      .catch(function() { Alert.error('Error Deactivating Account'); })
      .finally(function() { ctrl.showDeactivate = false; });
    };

    // Reactivate account
    this.showReactivate = false;
    this.closeReactivateModal = function() {
      $timeout(function() { ctrl.showReactivate = false; });
    };
    this.openReactivateModal = function() { ctrl.showReactivate = true; };
    this.reactivateUser = function() {
      User.reactivate({ id: ctrl.user.id }).$promise
      .then(function() {
        ctrl.user.deleted = false;
        Alert.success('Account Reactivated.');
      })
      .catch(function() { Alert.error('Error Reactivating Account'); })
      .finally(function() { ctrl.showReactivate = false; });
    };

    // Delete account
    this.showDelete = false;
    this.closeDeleteModal = function() {
      $timeout(function() { ctrl.showDelete = false; });
    };
    this.openDeleteModal = function() { ctrl.showDelete = true; };
    this.deleteUser = function() {
      User.delete({ id: ctrl.user.id }).$promise
      .then(function() { Alert.success('Account Deleted.'); })
      .catch(function() { Alert.error('Error Deleting Account'); })
      .finally(function() { ctrl.showDelete = false; });
    };
  }
];

module.exports = angular.module('ept.admin.profile.ctrl', [])
.controller('ProfileCtrl', ctrl)
.name;
