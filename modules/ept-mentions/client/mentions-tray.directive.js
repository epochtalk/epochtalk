var html = `<div id="mentions-icon" class="tray-icon">
          <i class="fa fa-at"></i>
          <div class="count" ng-if="vmMentions.mentionsCount()" ng-bind-html="vmMentions.mentionsCount()"></div>
          <ul id="mentions-dropdown">
            <li>Recent Mentions <div ng-click="vmMentions.dismiss({ type: 'mention'})" class="dismiss-all">Dismiss All</div></li>
            <li ng-if="!vmMentions.mentions().length">
              You currently have no mentions.
            </li>
            <li ng-repeat="mention in vmMentions.mentions()" ng-class="{ 'dismissed': mention.viewed }">
              <a ui-sref="posts.data({ threadId: mention.thread_id, start: mention.post_start, '#': mention.post_id })" ui-sref-opts="{reload: true}" ng-click="vmMentions.dismiss({ type: 'mention', id: mention.notification_id, viewed: mention.viewed })">
                <div class="mention-avatar">
                  <img src="{{mention.mentioner_avatar}}" />
                </div>
                <div class="mention-content">
                  <div class="msg"><strong>{{mention.mentioner}}</strong> mentioned you in <strong>{{mention.title}}</strong></div>
                  <div class="timestamp">{{mention.created_at | humanDate}}</div>
                </div>
              </a>
            </li>
            <li>View All</li>
          </ul>
        </div>`;

var directive = ['NotificationSvc', function(NotificationSvc) {
  return {
    restrict: 'E',
    template: html,
    scope: true,
    controllerAs: 'vmMentions',
    controller: [function() {
      var ctrl = this;

      this.refreshMentions = NotificationSvc.refreshMentionsList;
      this.refresh = NotificationSvc.refresh;

      this.mentions = NotificationSvc.getMentionsList;
      this.mentionsCount = NotificationSvc.getMentions;

      this.dismiss = NotificationSvc.dismiss;

      this.dismissNotification = function(opts) {
        return ctrl.dismiss(opts)
        .then(function() {
          ctrl.refreshMentions();
          ctrl.refresh();
        });
      };

    }]
  };
}];


angular.module('ept').directive('mentionsTray', directive);
