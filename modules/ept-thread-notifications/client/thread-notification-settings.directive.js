var directive = ['ThreadNotifications', function(ThreadNotifications) {
  return {
    restrict: 'E',
    scope: true,
    template: require('./thread-notification-settings.directive.html'),
    controllerAs: 'vmThreadSettings',
    controller: ['Alert', '$timeout', function(Alert, $timeout) {
      var ctrl = this;
      this.notificationsEnabled;
      this.showRemoveModal;

      (function init() {
        var query = { limit: 10 };
        return ThreadNotifications.get().$promise
        .then(function(data) {
          ctrl.notificationsEnabled = data.notify_replied_threads;
        });
      })();

      this.enableNotifications = function() {
        var payload = { enabled: ctrl.notificationsEnabled };
        return ThreadNotifications.enableNotifications(payload).$promise
        .then(function() {
          var action = ctrl.notificationsEnabled ? 'Enabled' : 'Disabled';
          Alert.success('Successfully ' + action + ' Thread Notifications');
        })
        .catch(function(e) {
          ctrl.notificationsEnabled = !ctrl.notificationsEnabled;
          Alert.error('There was an error updating your thread notification settings');
        });
      }

      this.removeSubscriptions = function() {
        return ThreadNotifications.removeSubscriptions().$promise
        .then(function() {
          Alert.success('Successfully removed all previous thread subscriptions');
        })
        .catch(function(e) {
          Alert.error('There was an error removing thread subscriptions');
        })
        .finally(function() { ctrl.showRemoveModal = false; });
      }

    }]
  };
}];


angular.module('ept').directive('threadNotificationSettings', directive);
