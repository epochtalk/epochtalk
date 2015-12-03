var remove = require('lodash/array/remove');

module.exports = ['$timeout', 'Alert', function($timeout, Alert) {
  return {
    restrict: 'E',
    template: require('./alert.html'),
    link: function($scope) {
      $scope.alerts = Alert.getAlerts();
      $scope.visibleAlerts = [];

      function addAlert(alert) {
        $scope.visibleAlerts.unshift(alert);
        // timer to delete alert
        $timeout(function() { $scope.removeAlert(alert.id); }, 10000);
      }

      function syncAlerts() {
        for(var i = 0; i < $scope.alerts.length; i++) {
          var temp = $scope.alerts.shift();
          if (temp) { addAlert(temp); }
        }
      }

      $scope.removeAlert = function(id) {
        remove($scope.visibleAlerts, function(alert) {
          return alert.id === id;
        });
        syncAlerts();
      };

      $scope.$watch('alerts', syncAlerts, true);
    }
  };
}];
