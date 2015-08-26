var fs = require('fs');
var _ = require('lodash');

module.exports = ['$timeout', 'Alert', function($timeout, Alert) {
  return {
    restrict: 'E',
    template: fs.readFileSync(__dirname + '/alert.html'),
    link: function($scope, $element, $attr) {
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
        _.remove($scope.visibleAlerts, function(alert) {
          return alert.id === id;
        });
        syncAlerts();
      };

      $scope.$watch('alerts', syncAlerts, true);
    }
  };
}];
