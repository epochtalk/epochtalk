var directive = ['IgnoreUsers', '$timeout', '$anchorScroll',
  function(IgnoreUsers, $timeout) {
  return {
    restrict: 'E',
    scope: true,
    template: require('./ignore.settings.directive.html'),
    controllerAs: 'vmIgnoreUserPosts',
    controller: [function() {
      // page variables
      var ctrl = this;


      (function init() {
        var query = { limit: 10 };
        return IgnoreUsers.ignored(query).$promise
        .then(function(ignored) {
          // index variables
          ctrl.page = ignored.page;
          ctrl.limit = ignored.limit;
          ctrl.users = ignored.data;
          ctrl.next = ignored.next;
          ctrl.prev = ignored.prev;
        });
      })();

      this.userToIgnore = {};

      // page actions

      this.unignore = function(user) {
        return IgnoreUsers.unignore({userId: user.id}).$promise
        .then(function() { $timeout(function() { user.ignored = false; }); });
      };

      this.ignore = function(user) {
        return IgnoreUsers.ignore({userId: user.id}).$promise
        .then(function(res) { $timeout(function() { user.ignored = true; }); return res; });
      };

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
