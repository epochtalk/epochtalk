var html = '<li ng-if="vmSMB.notOwner && vmSMB.loggedIn()">' +
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
    bindToController: { post: '=' },
    controllerAs: 'vmSMB',
    controller: [function() {
      this.loggedIn = Session.isAuthenticated;
      this.notOwner = Session.user.id !== this.post.user.id;
    }]
  };
}];

angular.module('ept').directive('sendMeritButton', directive);
