var html = `<div id="mentions-icon" class="tray-icon">
          <i class="fa fa-at"></i>
          <div class="count" ng-if="vmMentions.mentionsCount()" ng-bind-html="vmMentions.mentionsCount()"></div>
          <ul id="mentions-dropdown">
            <li>Recent Mentions</li>
            <li ng-if="!vmMentions.mentions().length">
              You currently have no mentions.
              {{vmMentions.mentions()}}
              {{vmMentions.mentionsCount()}}
            </li>
            <li ng-repeat="mention in vmMentions.mentions()">
              <a ui-sref="posts.data({ threadId: mention.thread_id, start: mention.post_start, '#': mention.post_id })">
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

var directive = [function() {
  return {
    restrict: 'E',
    template: html,
    scope: true,
    bindToController: { mentions: '=', mentionsCount: '=' },
    controllerAs: 'vmMentions',
    controller: [function() {
    }]
  };
}];


angular.module('ept').directive('mentionsTray', directive);
