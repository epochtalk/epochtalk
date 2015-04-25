var fs = require('fs');
var _ = require('lodash');

module.exports = ['$timeout', 'Alert', function($timeout, Alert) {
  return {
    restrict: 'E',
    template: fs.readFileSync(__dirname + '/alert.html'),
    link: function($scope, $element, $attr) {
      $scope.alerts = Alert.getAlerts();
      $scope.visibleAlerts = [];
      $scope.$watch('alerts', syncAlerts, true);

      function addAlert(alert) {
        $scope.visibleAlerts.push(alert);
        // timer to delete alert
        $timeout(function() { $scope.removeAlert(alert.id); }, 10000);
      }

      function syncAlerts() {
        if ($scope.alerts.length === 0) { return; }
        if ($scope.visibleAlerts.length > 2) { return; }

        var slotsOpen = 0;
        slotsOpen = 3 - $scope.visibleAlerts.length;
        for(var i = 0; i < slotsOpen; i++) {
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

    }
  };
}];
