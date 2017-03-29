var html = `<div id="mentions-icon" class="tray-icon" ng-class="{'open': vmMentions.open}" ng-click="vmMentions.open = true">
          <div class="hoverable" data-balloon="Mentions" data-balloon-pos="down"></div>
          <i class="fa fa-at"></i>
          <div class="count" ng-if="vmMentions.mentionsCount()" ng-bind-html="vmMentions.mentionsCount()"></div>
          <ul id="mentions-dropdown">
            <li>
              Recent Mentions
              <div ng-if="vmMentions.mentions().length" ng-click="vmMentions.dismiss({ type: 'mention'})" class="dismiss-all">
                <i class="fa fa-book"></i> Mark all read
              </div>
              <div ng-if="vmMentions.mentions().length" ng-click="vmMentions.delete({ type: 'mention'})" class="delete-all">
                <i class="fa fa-trash-o"></i> Delete all
              </div>
            </li>
            <li class="centered" ng-if="!vmMentions.mentions().length">
              You currently have no mentions.
            </li>
            <li ng-repeat="mention in vmMentions.mentions()" ng-class="{ 'dismissed': mention.viewed }">
              <a ui-sref="posts.data({ threadId: mention.thread_id, start: mention.post_start, '#': mention.post_id })" ui-sref-opts="{reload: true}" ng-click="vmMentions.dismiss({ type: 'mention', id: mention.notification_id, viewed: mention.viewed })">
                <div class="mention-unread"></div>
                <div class="mention-avatar">
                  <img src="{{mention.mentioner_avatar}}" />
                </div>
                <div class="mention-content">
                  <div class="msg"><strong>{{mention.mentioner}}</strong> mentioned you in <strong>{{mention.title}}</strong></div>
                  <div class="timestamp">{{mention.created_at | humanDate}}</div>
                </div>
              </a>
              <div class="mention-actions">
                <div ng-click="vmMentions.delete({ id: mention.id, type: 'mention', notification_id: mention.notification_id })" class="delete" data-balloon="Delete" data-balloon-pos="right">
                  <i class="fa fa-times"></i>
                </div>
                <div ng-if="!mention.viewed" ng-click="vmMentions.dismiss({ type: 'mention', id: mention.notification_id, viewed: mention.viewed })" class="unmarked" data-balloon="Mark Read" data-balloon-pos="right">
                  <i class="fa fa-circle-o"></i>
                </div>
                <div ng-if="mention.viewed" class="marked" data-balloon="Read" data-balloon-pos="right">
                  <i class="fa fa-check-circle-o"></i>
                </div>
              </div>
            </li>
            <li><a ui-sref="mentions" ui-sref-opts="{reload: true}">View all mentions <span ng-bind="vmMentions.unseenMentionsText()"></span></a></li>
          </ul>
        </div>
        <div id="mentions-overlay" ng-if="vmMentions.open" ng-click="vmMentions.open = false"></div>`;

var directive = ['NotificationSvc', function(NotificationSvc) {
  return {
    restrict: 'E',
    template: html,
    scope: true,
    controllerAs: 'vmMentions',
    controller: [function() {
      var ctrl = this;
      this.open = false;
      this.mentions = NotificationSvc.getMentionsList;
      this.mentionsCount = NotificationSvc.getMentions;
      this.dismiss = NotificationSvc.dismiss;
      this.delete = NotificationSvc.deleteMention;

      this.unseenMentionsText = function() {
        var unseenInList = 0;
        ctrl.mentions().forEach(function(mention) {
          if (!mention.viewed) { unseenInList++; }
        });
        var unseenHiddenCount = ctrl.mentionsCount() - unseenInList;
        return unseenHiddenCount > 0 ? '(' + unseenHiddenCount + ' unread)' : '';
      };
    }]
  };
}];


angular.module('ept').directive('mentionsTray', directive);
