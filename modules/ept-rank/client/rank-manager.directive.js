var cloneDeep = require('lodash/cloneDeep');

var directive = ['Ranks', 'Alert', '$timeout', function(Ranks, Alert, $timeout) {
  return {
    restrict: 'E',
    scope: true,
    template: require('./rank-manager.directive.html'),
    controllerAs: 'vm',
    controller: ['$scope', function($scope) {
      var ctrl = this;
      this.newRank = {};

      Ranks.get().$promise
      .then(function(ranks) {
        ctrl.ranks = ranks;
      });


      // Add Rank Modal
      this.saveRankBtnLabel = 'Save Rank';
      this.closeAdd = function() { ctrl.newRank = {}; }

      this.addRank = function() {
        var updatedRanks = cloneDeep(ctrl.ranks);
        updatedRanks.push(ctrl.newRank);
        Ranks.upsert(updatedRanks).$promise
        .then(function(latestRanks) {
          ctrl.ranks = latestRanks;
          Alert.success('Sucessfully added rank: ' + ctrl.newRank.name);
          ctrl.newRank = {};
          ctrl.showAddModal = false;
        })
        .catch(function(err) {
          var errMsg = 'There was an error adding the rank';
          if (err && err.data && err.data.statusCode === 400) {
            errMsg = 'Error: Ranks must have unique post counts'
          }
          Alert.error(errMsg);
        });
      }

    }]
  };
}];

angular.module('ept').directive('rankManager', directive);
