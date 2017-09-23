var directive = ['ThreadNotifications', function(ThreadNotifications) {
  return {
    restrict: 'E',
    scope: true,
    template: require('./thread-notification-settings.directive.html'),
    controllerAs: 'vmThreadSettings',
    controller: ['$timeout', function($timeout) {

    }]
  };
}];


angular.module('ept').directive('threadNotificationSettings', directive);
