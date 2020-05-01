var directive = ['Messages', '$timeout', 'Alert',
  function(Messages, $timeout, Alert) {
  return {
    restrict: 'E',
    scope: true,
    template: require('./messages-ignore-settings.directive.html'),
    controllerAs: 'vmIgnoreUserMessages',
    controller: [function() {
      // page variables
      var ctrl = this;
      this.emailsDisabled;
      this.showRemoveModal;
      this.userToIgnore = {};
      this.page = 1;

      this.init = function() {
        var query = { limit: 10 };
        return Messages.pageIgnoredUsers(query).$promise
        .then(function(ignored) {
          // index variables
          ctrl.page = ignored.page;
          ctrl.limit = ignored.limit;
          ctrl.users = ignored.data;
          ctrl.next = ignored.next;
          ctrl.prev = ignored.prev;
          return Messages.getMessageEmailSettings().$promise;
        })
        .then(function(data) { ctrl.emailsDisabled = data.email_messages; })
        .catch(function(err) { Alert.error('There was an error paging ignored users.'); });
      };

      $timeout(function() { ctrl.init(); })

      // page actions

      this.unignore = function(user) {
        return Messages.unignoreUser({ username: user.username }).$promise
        .then(function() {
          Alert.success('Successfully uningored ' + user.username);
          $timeout(function() { user.ignored = false; });
        });
      };

      this.ignore = function(user) {
        return Messages.ignoreUser({username: user.username}).$promise
        .then(function(res) {
          Alert.success('Successfully ingored ' + user.username);
          $timeout(function() { user.ignored = true; });
          return res;
        });
      };

      this.ignoreUser = function(username) {
        return Messages.ignoreUser({username: username}).$promise
        .then(function(res) {
          Alert.success('Successfully ingored ' + username);
          ctrl.pullPage(0);
          ctrl.userToIgnore = {};
          return res;
        });
      }

      // page controls
      this.pullPage = function(pageIncrement) {
        ctrl.page = ctrl.page + pageIncrement;
        var query = { page: ctrl.page, limit: ctrl.limit };

        // replace current threads with new threads
        return Messages.pageIgnoredUsers(query).$promise
        .then(function(pageData) {
          ctrl.prev = pageData.prev;
          ctrl.next = pageData.next;
          ctrl.users = pageData.data;
        });
      };

      this.enableMessageEmails = function() {
        var payload = { enabled: !ctrl.emailsDisabled };
        return Messages.enableMessageEmails(payload).$promise
        .then(function() {
          var action = ctrl.emailsDisabled ? 'Enabled' : 'Disabled';
          Alert.success('Successfully ' + action + ' Message Emails');
        })
        .catch(function(e) {
          ctrl.emailsDisabled = !ctrl.emailsDisabled;
          Alert.error('There was an error updating your mention settings');
        });
      };

    }]
  };
}];


angular.module('ept').directive('ignoreMessagesSettings', directive);
