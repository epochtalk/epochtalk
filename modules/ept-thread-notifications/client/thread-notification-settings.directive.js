var directive = ['ThreadNotifications', function(ThreadNotifications) {
  return {
    restrict: 'E',
    scope: true,
    template: require('./thread-notification-settings.directive.html'),
    controllerAs: 'vmThreadSettings',
    controller: ['Alert', '$timeout', function(Alert, $timeout) {
      var ctrl = this;
      this.notificationsDisabled;

      function init() {
        return ThreadNotifications.get().$promise
        .then(function(data) {
          ctrl.notificationsDisabled = data.notify_replied_threads;
        });
      }
      init();

      // notificationsDisabled is inverted due to weirdness with ng-model and
      // the delay it takes for the switch to toggle off
      this.enableNotifications = function() {
        var payload = { enabled: !ctrl.notificationsDisabled };
        return ThreadNotifications.enableNotifications(payload).$promise
        .then(function() {
          if (ctrl.notificationsDisabled) { // notifications were disabled, now enabled
            Alert.success('Successfully Enabled Thread Notifications');
            return;
          }
          else {
            Alert.success('Successfully Disabled Thread Notifications');
            return ThreadNotifications.removeSubscriptions().$promise;
          }
        })
        .catch(function(e) {
          ctrl.notificationsDisabled = !ctrl.notificationsDisabled;
          Alert.error('There was an error updating your thread notification settings');
        });
      };

    }]
  };
}];


angular.module('ept').directive('threadNotificationSettings', directive);
