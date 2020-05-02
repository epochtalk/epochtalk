var directive = ['IgnoreUsers', 'Alert', '$timeout',
  function(IgnoreUsers, Alert, $timeout) {
  return {
    restrict: 'E',
    scope: true,
    template: require('./ignore.settings.directive.html'),
    controllerAs: 'vmIgnoreUserPosts',
    controller: [function() {
      // page variables
      var ctrl = this;
      this.userToIgnore = {};
      this.page = 1;

      this.init = function() {
        var query = { limit: 10 };
        return IgnoreUsers.ignored(query).$promise
        .then(function(ignored) {
          // index variables
          ctrl.page = ignored.page;
          ctrl.limit = ignored.limit;
          ctrl.users = ignored.data;
          ctrl.next = ignored.next;
          ctrl.prev = ignored.prev;
          return;
        })
        .catch(function(err) { Alert.error('There was an error paging ignored users.'); });
      };

      $timeout(function() { ctrl.init(); })

      // page actions

      this.unignore = function(user) {
        return IgnoreUsers.unignore({ id: user.id }).$promise
        .then(function() {
          Alert.success('Successfully uningored ' + user.username);
          $timeout(function() { user.ignored = false; });
        });
      };

      this.ignore = function(user) {
        return IgnoreUsers.ignore({id: user.id}).$promise
        .then(function(res) {
          Alert.success('Successfully ingored ' + user.username);
          $timeout(function() { user.ignored = true; });
          return res;
        });
      };

      this.ignoreUser = function(user) {
        return IgnoreUsers.ignore({id: user.user_id}).$promise
        .then(function(res) {
          Alert.success('Successfully ingored ' + user.username);
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
        IgnoreUsers.ignored(query).$promise
        .then(function(pageData) {
          ctrl.prev = pageData.prev;
          ctrl.next = pageData.next;
          ctrl.users = pageData.data;
        });
      };
    }]
  };
}];


angular.module('ept').directive('ignoreUserSettings', directive);
