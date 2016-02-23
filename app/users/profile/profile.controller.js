var ctrl = ['user', 'AdminUsers', 'User', 'Session', 'Alert', '$scope', '$timeout', '$filter', '$state', '$location',
  function(user, AdminUsers, User, Session, Alert, $scope, $timeout, $filter, $state, $location) {
    var ctrl = this;
    this.user = user;
    this.displayUser = angular.copy(user);
    this.displayUser.avatar = this.displayUser.avatar || 'https://fakeimg.pl/400x400/ccc/444/?text=' + this.displayUser.username;
    this.user.dob = $filter('date')(this.user.dob, 'longDate');
    this.user.post_count = this.user.post_count || 0;
    this.user.raw_signature = this.user.raw_signature || this.user.signature;
    // This isn't the profile users true local time, just a placeholder
    this.userLocalTime = $filter('date')(Date.now(), 'h:mm a (Z)');
    this.displayPostsUrl = false;

    this.controlAccess = Session.getControlAccessWithPriority('profileControls', user.priority);
    // Only allow reactivating/deactivating of own account
    this.controlAccess.deactivate = this.controlAccess.deactivate && Session.user.id === user.id;
    this.controlAccess.reactivate = this.controlAccess.reactivate && Session.user.id === user.id;
    this.editable = Session.user.id === user.id || this.controlAccess.privilegedUpdate;
    this.adminVisitor = Session.user.id !== user.id && this.controlAccess.privilegedUpdate;

    // Check if user is banned
    this.ban_expiration = null;
    if (this.adminVisitor && this.user.ban_expiration && new Date(this.user.ban_expiration) > new Date()) {
      this.ban_expiration = $filter('humanDate')(this.user.ban_expiration, true);
    }

    var calcAge = function(dob) {
      if (!dob) { return '';}
      dob = new Date(dob);
      var ageDiff = Date.now() - dob.getTime();
      var ageDate = new Date(ageDiff);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    };
    this.userAge = calcAge(this.displayUser.dob);

    // Edit Profile
    this.editProfile = false;
    this.saveProfile = function() {
      var changeProfileUser = {
        id: ctrl.user.id,
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

      var promise;
      if (ctrl.adminVisitor) { promise = AdminUsers.update(changeProfileUser).$promise; }
      else { promise = User.update(changeProfileUser).$promise; }
      promise.then(function(data) {
        Alert.success('Successfully saved profile');
        // redirect page if username changed
        if (ctrl.displayUser.username !== data.username) {
          if (!ctrl.adminVisitor) { Session.setUsername(ctrl.user.username); }
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
        id: ctrl.user.id,
        username: ctrl.user.username,
        avatar: ctrl.user.avatar,
      };

      var promise;
      if (ctrl.adminVisitor) { promise = AdminUsers.update(changeAvatarUser).$promise; }
      else { promise = User.update(changeAvatarUser).$promise; }
      promise.then(function(data) {
        ctrl.updateDisplayUser(data);
        ctrl.displayUser.avatar = ctrl.displayUser.avatar || 'https://fakeimg.pl/400x400/ccc/444/?text=' + ctrl.displayUser.username;
        if(!ctrl.adminVisitor) { Session.setAvatar(ctrl.displayUser.avatar); }
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
        id: ctrl.user.id,
        username: ctrl.user.username,
        raw_signature: ctrl.user.raw_signature
      };

      var promise;
      if (ctrl.adminVisitor) { promise = AdminUsers.update(changeSigUser).$promise; }
      else { promise = User.update(changeSigUser).$promise; }
      promise.then(function(data) {
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
    this.passData = { id: ctrl.user.id, username: ctrl.user.username };
    this.clearPasswordFields = function() {
      $timeout(function() {
        ctrl.passData = { id: ctrl.user.id, username: ctrl.user.username };
      }, 500);
    };

    this.savePassword = function() {
      var promise;
      console.log(ctrl.passData);
      if (ctrl.adminVisitor) { promise = AdminUsers.update(ctrl.passData).$promise; }
      else { promise = User.update(ctrl.passData).$promise; }
      promise.then(function() {
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
    this.openDeactivateModal = function(index) { ctrl.showDeactivate = true; };
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
    this.openReactivateModal = function(index) { ctrl.showReactivate = true; };
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
    this.openDeleteModal = function(index) { ctrl.showDelete = true; };
    this.deleteUser = function() {
      User.delete({ id: ctrl.user.id }).$promise
      .then(function() { Alert.success('Account Deleted.'); })
      .catch(function() { Alert.error('Error Deleting Account'); })
      .finally(function() { ctrl.showDelete = false; });
    };


    // DUMMY CHART DATA
    // var data = {
    //   labels: ['August', 'September', 'October', 'November', 'December', 'January', 'February'],
    //   datasets: [
    //     {
    //       label: 'My First dataset',
    //       fillColor: 'rgba(220,220,220,0.2)',
    //       strokeColor: 'rgba(220,220,220,1)',
    //       pointColor: 'rgba(220,220,220,1)',
    //       pointStrokeColor: '#fff',
    //       pointHighlightFill: '#fff',
    //       pointHighlightStroke: 'rgba(220,220,220,1)',
    //       data: [65, 59, 80, 81, 56, 55, 40]
    //     }
    //   ]
    // };
    // Chart.defaults.global.responsive = true;
    // Chart.defaults.global.maintainAspectRatio = false;
    // var ctx = document.getElementById('myChart').getContext('2d');
    // var myNewChart = new Chart(ctx).Line(data);

    // Only show user's posts if viewing via the profile state
    if ($state.current.name === 'profile') {
      // Load posts state with proper state params
      var params = $location.search();
      $state.go('profile.posts', params, { location: false, reload: 'profile.posts' });
    }
    else { this.displayPostsUrl = true; }
  }
];

module.exports = angular.module('ept.profile.ctrl', [])
.controller('ProfileCtrl', ctrl)
.name;
