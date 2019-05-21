var directive = [function() {
  return {
    restrict: 'E',
    scope: true,
    bindToController: { user: '=' },
    template: require('./profile.html'),
    controllerAs: 'vmProfile',
    controller: [ 'Conversations', 'Messages', 'User', 'Session', 'Alert', 'PreferencesSvc', 'Websocket', '$timeout', '$scope', '$window', '$filter', '$state', function(Conversations, Messages, User, Session, Alert, PreferencesSvc, Websocket, $timeout, $scope, $window, $filter, $state) {
      var ctrl = this;
      this.newConversation = {subject: '', body: '', receiver_ids: [], previewBody: ''};
      this.newMessage = {subject: '', body: '', receiver_ids: [], previewBody: '' };

      this.isLoggedIn = function() { return Session.isAuthenticated(); };

      this.canPageUserNotes = function() {
        return Session.isAuthenticated() && Session.hasPermission('userNotes.page');
      };

      // Check if user is banned
      this.ban_expiration = function() {
        var result;
        var expiration = this.user.ban_expiration;
        var canBan = Session.hasPermission('bans.ban.allow');

        if (canBan && expiration && new Date(expiration) > new Date()) {
          result = $filter('humanDate')(expiration, true);
        }
        return result;
      };

      // Compute user's age
      this.userAge = function(dob) {
        if (!dob) { return; }
        dob = new Date(dob);
        var ageDate = new Date(Date.now() - dob.getTime());
        return Math.abs(ageDate.getUTCFullYear() - 1970);
      };

      // Permissions
      this.pageOwner = function() { return Session.user.id === this.user.id; };

      this.canUpdate = function() {
        if (!Session.isAuthenticated()) { return false; }
        if (!Session.hasPermission('users.update.allow')) { return false; }

        var same = Session.hasPermission('users.update.bypass.priority.admin');
        var lower = Session.hasPermission('users.update.bypass.priority.mod');

        var valid = false;
        if (ctrl.pageOwner()) { valid = true; }
        else if (same) { valid = Session.getPriority() <= this.user.priority; }
        else if (lower) { valid = Session.getPriority() < this.user.priority; }
        return valid;
      };

      this.canUpdateUsername = function() {
        if (!Session.isAuthenticated()) { return false; }
        if (!Session.hasPermission('users.changeUsername.allow')) { return false; }
        return canUpdate();
      };


      this.canUpdatePrivate = function() { return ctrl.canUpdate() && ctrl.pageOwner(); };

      this.canDeactivate = function() {
        if (!Session.isAuthenticated()) { return false; }
        if (!Session.hasPermission('users.deactivate.allow')) { return false; }
        if (ctrl.user.deleted) { return false; }
        if (ctrl.pageOwner()) { return true; }
        else { return false; }
      };

      this.canReactivate = function() {
        if (!Session.isAuthenticated()) { return false; }
        if (!Session.hasPermission('users.reactivate.allow')) { return false; }
        if (!ctrl.user.deleted) { return false; }
        if (ctrl.pageOwner()) { return true; }
        else { return false; }
      };

      this.canDelete = function() {
        if (!Session.isAuthenticated()) { return false; }
        if (!Session.hasPermission('users.delete.allow')) { return false; }

        var same = Session.hasPermission('users.delete.bypass.priority.admin');
        var lower = Session.hasPermission('users.delete.bypass.priority.mod');

        var valid = false;
        if (ctrl.pageOwner()) { valid = true; }
        else if (same) { valid = Session.getPriority() <= this.user.priority; }
        else if (lower) { valid = Session.getPriority() < this.user.priority; }
        return valid;
      };

      this.canMessage = function() {
        var valid = false;
        if (!Session.isAuthenticated()) { return false; }
        if (!Session.hasPermission('conversations.create.allow')) { return false; }
        if (!ctrl.pageOwner()) { valid = true; }
        return valid;
      };

      // Edit Profile
      this.editProfile = false;
      this.editProfileUser = {};
      this.openEditProfile = function() {
        this.editProfileUser = angular.copy(this.user);
        if (this.editProfileUser.dob) { // safari fix
          this.editProfileUser.dob = new Date(this.editProfileUser.dob);
        }
        delete this.editProfileUser.email;
        delete this.editProfileUser.raw_signature;
        delete this.editProfileUser.signature;
        delete this.editProfileUser.avatar;
        this.editProfile = true;
      };
      this.saveProfile = function() {
        User.update({ id: this.user.id }, this.editProfileUser).$promise
        .then(function(data) {
          // redirect page if username changed
          if (ctrl.user.username !== data.username) {
            if (ctrl.pageOwner()) { Session.setUsername(data.username); }
            var params = { username: data.username};
            $state.go('profile.posts', params, { location: true, reload: false });
          }
          else {
            angular.extend(ctrl.user, data);
            ctrl.user.dob = data.dob;
          }
        })
        .then(function() { Alert.success('Successfully saved profile'); })
        .catch(function() { Alert.error('Profile could not be updated'); })
        .finally(function() { ctrl.editProfile = false; });
      };

      // Edit Avatar
      this.editAvatar = false;
      this.editAvatarUser = {};
      this.openEditAvatar = function() {
        this.editAvatarUser = {
          username: ctrl.user.username,
          avatar: ctrl.user.avatar
        };
        ctrl.editAvatar = true;
      };

      this.saveAvatar = function() {
        User.update({ id: this.user.id }, ctrl.editAvatarUser).$promise
        .then(function(data) {
          ctrl.user.avatar = ctrl.editAvatarUser.avatar;
          angular.extend(ctrl.user, data);
          if(ctrl.pageOwner()) { Session.setAvatar(ctrl.editAvatarUser.avatar); }
        })
        .then(function() { Alert.success('Successfully updated avatar'); })
        .catch(function() { Alert.error('Avatar could not be updated'); })
        .finally(function() { ctrl.editAvatar = false; });
      };

      // Edit Signature
      this.editSignature = false;
      this.editSigUser = {};
      this.openEditSignature = function() {
        this.editSigUser = {
          username: this.user.username,
          raw_signature: this.user.raw_signature || this.user.signature
        };
        this.editSignature = true;
      };
      this.saveSignature = function() {
        User.update({ id: this.user.id }, this.editSigUser).$promise
        .then(function(data) { angular.extend(ctrl.user, data); })
        .then(function() { Alert.success('Successfully updated signature'); })
        .catch(function() { Alert.error('Signature could not be updated'); })
        .finally(function() { ctrl.editSignature = false; });
      };

      // Edit Password
      this.editPassword = false;
      this.passData = {};
      this.openEditPassword = function() {
        this.passData = { username: this.user.username };
        this.editPassword = true;
      };
      this.savePassword = function() {
        User.update({ id: this.user.id }, this.passData).$promise
        .then(function() { ctrl.passData = {}; })
        .then(function() { Alert.success('Sucessfully changed account password'); })
        .catch(function() { Alert.error('Error updating password'); })
        .finally(function() { ctrl.editPassword = false; });
      };

      // Edit Email
      this.editEmail = false;
      this.emailData = {};
      this.openEditEmail = function() {
        this.emailData = {
          username: this.user.username,
          email: this.user.email
        };
        this.editEmail = true;
      };
      this.saveEmail = function() {
        User.update({ id: this.user.id }, this.emailData).$promise
        .then(function(data) { ctrl.user.email = data.email; })
        .then(function() { Alert.success('Sucessfully changed account email'); })
        .catch(function() { Alert.error('Invalid Credentials'); })
        .finally(function() { ctrl.editEmail = false; });
      };

      // Deactivate account
      this.deactivateUser = function() {
        User.deactivate({ id: ctrl.user.id }).$promise
        .then(function() { ctrl.user.deleted = true; })
        .then(function() { Alert.success('Account Deactivated.'); })
        .catch(function() { Alert.error('Error Deactivating Account'); })
        .finally(function() { ctrl.showDeactivate = false; });
      };

      // Reactivate account
      this.reactivateUser = function() {
        User.reactivate({ id: ctrl.user.id }).$promise
        .then(function() { ctrl.user.deleted = false; })
        .then(function() { Alert.success('Account Reactivated.'); })
        .catch(function() { Alert.error('Error Reactivating Account'); })
        .finally(function() { ctrl.showReactivate = false; });
      };

      // Delete account
      this.deleteUser = function() {
        User.delete({ id: ctrl.user.id }).$promise
        .then(function() { Alert.success('Account Deleted.'); })
        .catch(function() { Alert.error('Error Deleting Account'); })
        .finally(function() { ctrl.showDelete = false; });
      };

      // Create Conversation
      this.newConversation = {};
      this.showConvoModal = false;

      this.openConvoModal = function() {
        ctrl.newConversation = {};
        ctrl.showConvoModal = true;
      };

      $scope.$watch(function() { return ctrl.newMessage.body; }, function(body) {
        if (body) {
          // BBCode Parsing
          var rawText = body;
          var processed = rawText;
          $window.parsers.forEach(function(parser) {
            processed = parser.parse(processed);
          });
          // re-bind to scope
          ctrl.newMessage.previewBody = processed;
        }
      });

      $scope.$watch(function() { return ctrl.newConversation.body; }, function(body) {
        if (body) {
          // BBCode Parsing
          var rawText = body;
          var processed = rawText;
          $window.parsers.forEach(function(parser) {
            processed = parser.parse(processed);
          });
          // re-bind to scope
          ctrl.newConversation.previewBody = processed;
        }
      });

      this.createConversation = function() {
        // create a new conversation id to put this message under
        var newMessage = {
          receiver_ids: [ ctrl.user.id ],
          subject: ctrl.newConversation.subject,
          body: ctrl.newConversation.body,
        };

        Conversations.save(newMessage).$promise
        .then(function() { Alert.success('Successfully messaged user ' + ctrl.user.username); })
        .catch(function(err) {
          var msg = 'Failed to message ' + ctrl.user.username;
          if (err && err.status === 403) { msg = err.data.message; }
          Alert.error(msg);
        })
        .finally(function() {
          ctrl.newConversation = { body: '', receiver_ids: [ ctrl.user.id ] };
          ctrl.showConvoModal = false;
        });
      };

      this.showBanModal = false; // manage ban modal visibility boolean

      this.canBanUser = function() {
        var loggedIn = Session.isAuthenticated();
        var banPermission = Session.hasPermission('bans.ban.allow');
        var banBoardsPermission = Session.hasPermission('bans.banFromBoards');
        var profileView = $state.current.name === 'profile.posts';
        if (loggedIn && profileView && (banPermission || banBoardsPermission)) { return true; }
        else { return false; }
      };

      this.showManageBans = function(user) {
        ctrl.selectedUser = user;
        ctrl.showBanModal = true;
      };

      this.updateUser = function(params) {
        if (!params.banError && params.expiration) {
          var expiration = new Date(params.expiration) > new Date() ? params.expiration : undefined;
          ctrl.user.ban_expiration = expiration;
        }
      };

      // Websockets
      this.isOnline = false;
      $timeout(function() {
        Websocket.isOnline(ctrl.user.id, function(err, data) {
          if (err) { return console.log(err); }
          else { ctrl.isOnline = data.online; }
        });
      });

      // Preferences
      this.editPreferences = false;
      this.tempPreferences = {};
      this.openEditPreferences = function() {
        ctrl.tempPreferences.username = ctrl.user.username;
        ctrl.tempPreferences.posts_per_page = ctrl.user.posts_per_page;
        ctrl.tempPreferences.threads_per_page = ctrl.user.threads_per_page;
        ctrl.tempPreferences.collapsed_categories = ctrl.user.collapsed_categories;
        this.editPreferences = true;
      };

      this.savePreferences = function() {
        User.update({ id: ctrl.user.id }, ctrl.tempPreferences).$promise
        .then(function(data) {
          ctrl.user.posts_per_page = data.posts_per_page;
          ctrl.user.threads_per_page = data.threads_per_page;
        })
        .then(function() {
          var tempPref = PreferencesSvc.preferences;
          tempPref.posts_per_page = ctrl.user.posts_per_page;
          tempPref.threads_per_page = ctrl.user.threads_per_page;
          PreferencesSvc.setPreferences(tempPref);
        })
        .then(function() { Alert.success('Successfully saved preferences'); })
        .catch(function() { Alert.error('Preferences could not be updated'); })
        .finally(function() { ctrl.editPreferences = false; });
      };
    }]
  };
}];

module.exports = angular.module('ept.directives.profile', [])
.directive('profile', directive);
