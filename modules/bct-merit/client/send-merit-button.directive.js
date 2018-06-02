var html = '<li ng-if="vmSMB.notOwner && vmSMB.loggedIn() && vmSMB.totalMerit >= 1">' +
           '  <a ng-href="#" data-balloon="Merit Post" ng-click="PostsParentCtrl.meritPost = post; PostsParentCtrl.showMeritModal = true;">' +
           '    <i class="fa fa-heart"></i>' +
           '  </a>' +
           '</li>';

var directive = ['Session', function(Session) {
  return {
    restrict: 'E',
    scope: true,
    replace: true,
    template: html,
    bindToController: { post: '=', sendableMerit: '=' },
    controllerAs: 'vmSMB',
    controller: ['$scope', function($scope) {
      var ctrl = this;

      this.totalMerit = 0;

      $scope.$watch(function() {
        var total = 0;
        if (ctrl.sendableMerit) {
          total = ctrl.sendableMerit.sendable_user_merit + ctrl.sendableMerit.sendable_source_merit;
        }
        return total;
      }, function(total) { ctrl.totalMerit = total; });

      this.loggedIn = Session.isAuthenticated;
      this.notOwner = Session.user.id !== this.post.user.id;
    }]
  };
}];

angular.module('ept').directive('sendMeritButton', directive);
