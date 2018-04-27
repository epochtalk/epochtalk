var cloneDeep = require('lodash/cloneDeep');

var directive = ['Ranks', 'Alert', 'Session', function(Ranks, Alert, Session) {
  return {
    restrict: 'E',
    scope: true,
    template: require('./rank-manager.directive.html'),
    controllerAs: 'vm',
    controller: [function() {
      var ctrl = this;

      // Init
      Ranks.get().$promise.then(function(ranks) { ctrl.ranks = ranks; });

      // Permissions Handling
      this.hasPermission = function() { return Session.hasPermission('rank.upsert.allow'); };

      // Add Rank Modal
      this.newRank = {};
      this.saveRankBtnLabel = 'Save Rank';
      this.closeAdd = function() { ctrl.newRank = {}; };

      this.addRank = function() {
        ctrl.addSubmitted = true;
        ctrl.saveRankBtnLabel = 'Loading...';
        var updatedRanks = cloneDeep(ctrl.ranks);
        updatedRanks.push(ctrl.newRank);
        Ranks.upsert(updatedRanks).$promise
        .then(function(latestRanks) {
          ctrl.ranks = latestRanks;
          Alert.success('Sucessfully added rank ' + ctrl.newRank.name);
          ctrl.newRank = {};
          ctrl.showAddModal = false;
        })
        .catch(function(err) {
          var errMsg = 'There was an error adding the rank';
          if (err && err.data && err.data.statusCode === 400) {
            errMsg = 'Ranks must have unique post counts';
          }
          else if (err && err.data && err.data.statusCode === 403) {
            errMsg = 'You do not have permissions to update ranks';
          }
          Alert.error(errMsg);
        })
        .finally(function() {
          ctrl.saveRankBtnLabel = 'Save Rank';
          ctrl.addSubmitted = false;
        });
      };

      // Delete Rank Modal
      this.deleteRankBtnLabel = 'Delete Rank';

      this.deleteRank = function(rank) {
        ctrl.deleteSubmitted = true;
        ctrl.deleteRankBtnLabel = 'Loading...';
        var updatedRanks = cloneDeep(ctrl.ranks).filter(function(o) {
          return o.post_count !== rank.post_count;
        });

        Ranks.upsert(updatedRanks).$promise
        .then(function(latestRanks) {
          ctrl.ranks = latestRanks;
          Alert.success('Sucessfully deleted rank ' + ctrl.newRank.name);
          ctrl.showDeleteModal = false;
        })
        .catch(function(err) {
          var errMsg = 'There was an error deleting the rank';
          if (err && err.data && err.data.statusCode === 403) {
            errMsg = 'You do not have permissions to delete ranks';
          }
          Alert.error(errMsg);
        })
        .finally(function() {
          ctrl.deleteRankBtnLabel = 'Delete Rank';
          ctrl.deleteSubmitted = false;
        });
      };

      // Edit Rank Modal
      this.editRankBtnLabel = 'Edit Rank';

      this.editRank = function(originalRank, editedRank) {
        ctrl.editSubmitted = true;
        ctrl.editRankBtnLabel = 'Loading...';

        var updatedRanks = cloneDeep(ctrl.ranks).filter(function(o) {
          return o.post_count !== originalRank.post_count;
        });

        updatedRanks.push(editedRank);

        Ranks.upsert(updatedRanks).$promise
        .then(function(latestRanks) {
          ctrl.ranks = latestRanks;
          Alert.success('Sucessfully edited rank ' + editedRank.name);
          ctrl.showEditModal = false;
        })
        .catch(function(err) {
          var errMsg = 'There was an error editing the rank';
          if (err && err.data && err.data.statusCode === 403) {
            errMsg = 'You do not have permissions to edit ranks';
          }
          Alert.error(errMsg);
        })
        .finally(function() {
          ctrl.editRankBtnLabel = 'Edit Rank';
          ctrl.editSubmitted = false;
        });
      };

    }]
  };
}];

angular.module('ept').directive('rankManager', directive);
