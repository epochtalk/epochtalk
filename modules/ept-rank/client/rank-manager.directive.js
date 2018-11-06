var cloneDeep = require('lodash/cloneDeep');

var directive = ['Ranks', 'Alert', 'Session', function(Ranks, Alert, Session) {
  return {
    restrict: 'E',
    scope: true,
    template: require('./rank-manager.directive.html'),
    controllerAs: 'vm',
    controller: [function() {
      var ctrl = this;

      this.keys = [];
      this.metrics = [];
      this.metricNames = [];
      // Init
      Ranks.get().$promise.then(function(ranks) {
        ctrl.ranks = ranks;
        ctrl.rankMapping = ranks;
        refreshMetrics();
      });

      function refreshMetrics() {
        if (ctrl.ranks.length) { // filter out custom metrics
          ctrl.metrics = Object.keys(ctrl.ranks[0]).filter(f => f !== "name").sort();
          ctrl.metricNames = ctrl.metrics.map(f => (f.charAt(0).toUpperCase() + f.slice(1))
            .replace('_', ' '));
        }
      }

      // Permissions Handling
      this.hasPermission = function() {
        return Session.hasPermission('rank.upsert.allow') &&
          Session.hasPermission('rank.get.allow');
      };

      // Add Rank Modal
      this.saveRankBtnLabel = 'Save Rank Map';

      this.editMap = function() {
        ctrl.editMapSubmitted = true;
        ctrl.saveRankBtnLabel = 'Loading...';
        var invalid;
        // Ensure all ranks have the same keys
        if (ctrl.rankMapping.length) {
          ctrl.keys = Object.keys(ctrl.rankMapping[0]).sort();
        }
        for(var i = 0; i < ctrl.rankMapping.length; i++) {
          var keys = Object.keys(ctrl.rankMapping[i]).sort();
          if (ctrl.keys.toString() !== keys.toString()) { invalid = true; break; }
        }
        if (invalid) {
          Alert.error('Ranks must contain the same metric keys');
          ctrl.saveRankBtnLabel = 'Save Rank Map';
          ctrl.editMapSubmitted = false;
        }
        else {
          Ranks.upsert(ctrl.rankMapping).$promise
          .then(function(latestRanks) {
            ctrl.ranks = latestRanks;
            refreshMetrics();
            Alert.success('Sucessfully updated rank map');
            ctrl.showEditMapModal = false;
          })
          .catch(function(err) {
            var errMsg = 'There was an error adding the rank';
            if (err && err.data && err.data.statusCode === 400) {
              errMsg = 'Ranks metrics must be unique per rank';
            }
            else if (err && err.data && err.data.statusCode === 403) {
              errMsg = 'You do not have permissions to update ranks';
            }
            Alert.error(errMsg);
          })
          .finally(function() {
            ctrl.saveRankBtnLabel = 'Save Rank Map';
            ctrl.editMapSubmitted = false;
          });
        }
      };

    }]
  };
}];

angular.module('ept').directive('rankManager', directive);
