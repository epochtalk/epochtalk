var html= '<div class="ignore-directive">';
//html += '<a ng-if="vm.Session.isAuthenticated()" ng-href="#" ui-sref="ignored-users">';
html += '<a ng-if="vm.canIgnore()" ng-click="vm.ignore()">Ignore</a>';
html += '<a ng-if="vm.canUnignore()" ng-click="vm.unignore()">Unignore</a>';
//html += '</a>';
html += '</div>';

var directive = ['IgnoreUsers', 'Session', 'Alert', '$state',
  function(IgnoreUsers, Session, Alert, $state) {
  return {
    restrict: 'E',
    scope: true,
    bindToController: { post: '=' },
    template: html,
    controllerAs: 'vm',
    controller: [function() {
      var ctrl = this;

      this.Session = Session;
      this.sessionUser = Session.user;
      this.user = this.post.user;

      this.canIgnore = function() {
        var valid = true;
        if (!Session.isAuthenticated()) { valid = false; }
        if (ctrl.user.id === ctrl.sessionUser.id) { valid = false; }
        if (ctrl.user._ignored) { valid = false; }
        return valid;
      };

      this.canUnignore = function() {
        var valid = true;
        if (!Session.isAuthenticated()) { valid = false; }
        if (ctrl.user.id === ctrl.sessionUser.id) { valid = false; }
        if (!ctrl.user._ignored) { valid = false; }
        return valid;
      };

      this.ignore = function() {
        return IgnoreUsers.ignore({userId: ctrl.user.id}).$promise
        .then(function() { Alert.success('Ignoring ' + ctrl.user.username); })
        .then(function() { $state.go($state.$current, { page: undefined, start: ctrl.post.position, '#': ctrl.post.id }, {reload:true}); })
        .catch(function(){ Alert.error('Error trying to ignore user.'); });
      };

      this.unignore = function() {
        return IgnoreUsers.unignore({userId: ctrl.user.id}).$promise
        .then(function() { Alert.success('No longer ignoring ' + ctrl.user.username); })
        .then(function() { $state.go($state.$current, { page: undefined, start: ctrl.post.position, '#': ctrl.post.id }, {reload:true}); })
        .catch(function(){ Alert.error('Error trying to stop ignoring user.'); });
      };
    }]
  };
}];


angular.module('ept').directive('ignorePosts', directive);
