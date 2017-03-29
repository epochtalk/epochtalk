var html = `<li ng-click="HeaderCtrl.showMobileMenu = false" >
          <a ui-sref="mentions"><i class="fa fa-at" aria-hidden="true"></i>Mentions</a>
          <div class="count" ng-if="vmMentionsMenu.mentionsCount()" ng-bind-html="vmMentionsMenu.mentionsCount()"></div>
        </li>`;

var directive = ['NotificationSvc', function(NotificationSvc) {
  return {
    restrict: 'E',
    template: html,
    scope: true,
    controllerAs: 'vmMentionsMenu',
    controller: [function() {
      this.mentionsCount = NotificationSvc.getMentions;
    }]
  };
}];


angular.module('ept').directive('mentionsMenu', directive);
